//
// 与えられたデータを解析してサブタスク、ストーリーの生成を行うツール
//
const JiraClient = require('jira-connector')
const { Observable } = require('rx')
const fs = require('fs');

const file = fs.readFileSync('secret.json', 'utf8');
const json = JSON.parse(file);

const EPIC_KEY = "エピック"
const STORY_KEY = "ストーリー"
const SUBTASK_KEY = "サブタスク"

// ロガー
const logger = {
  i:(info) => {
    console.info(info);
  },
  e:(err) => {
    console.error(err)
  },
  l:(messsage) => {
    console.log(messsage)
  }
}

let jira = new JiraClient(
  {
    host: json.atlassianURL,
    basic_auth: {
      username: json.username,
      password: json.password
    }
  }
);

const PROJECT_KEY = "PNM"

jira.issueType.getAllIssueTypes({projectKeys: PROJECT_KEY},(err, responses) => {

  // エラーがあったら
  if(err) {
    logger.e(err)
    return
  }

  //
  // エピックの取得
  let issueTypes = Observable.from(responses)

  let searchSpecularIssue = (id, title, projectKey)=>{

    let jql = `issueType=${id}&project=${projectKey}&resolution=Unresolved`
    jira.search.search({
         jql: jql
     }, (error, result)=>{

       if (error) {
         logger.e(error);
         return;
       }

      logger.l(`=========== ${title} ===========`)
      Observable.from(result.issues).map(issue => issue.fields.summary).subscribe(title => {
        logger.l(title)
      })
    })
  }

  // エピック
  issueTypes.filter(type => type.name == EPIC_KEY).map(type => type.id).subscribe((id)=>{
    searchSpecularIssue(id, EPIC_KEY ,PROJECT_KEY)
  })

  issueTypes.filter(type => type.name == STORY_KEY).map(type => type.id).subscribe((id)=>{
    searchSpecularIssue(id,STORY_KEY, PROJECT_KEY)
  })

  issueTypes.filter(type => type.name == SUBTASK_KEY).map(type => type.id).subscribe((id)=>{
    searchSpecularIssue(id,SUBTASK_KEY, PROJECT_KEY)
  })
})
