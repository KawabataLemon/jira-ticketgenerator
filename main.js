//
// 与えられたデータを解析してサブタスク、ストーリーの生成を行うツール
//
const JiraClient = require('jira-connector')
const { Observable } = require('rx')
const fs = require('fs')
const SubTask = require('./SubTask.js')
const Story = require('./Story.js')

const file = fs.readFileSync('secret.json', 'utf8')
const json = JSON.parse(file)

const EPIC_KEY = "エピック"
const STORY_KEY = "ストーリー"
const SUBTASK_KEY = "サブタスク"

// 新規作成用のキー
const PROJECT_IDS = {
  EPIC_KEY: undefined,
  STORY_KEY: undefined,
  SUBTASK_KEY: undefined
}

// ロガー
const logger = {
  debug: false,
  i:(info) => {
    console.info(info);
  },
  e:(err) => {
    console.error(err)
  },
  l:(messsage) => {
    if (logger.debug) console.log(messsage)
  }
}

let jira = new JiraClient( {
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
    PROJECT_IDS.EPIC_KEY = id
    searchSpecularIssue(id, EPIC_KEY, PROJECT_KEY)
  })

  issueTypes.filter(type => type.name == STORY_KEY).map(type => type.id).subscribe((id)=>{
    PROJECT_IDS.STORY_KEY = id
    searchSpecularIssue(id, STORY_KEY, PROJECT_KEY)
  })

  issueTypes.filter(type => type.name == SUBTASK_KEY).map(type => type.id).subscribe((id)=>{
    PROJECT_IDS.SUBTASK_KEY = id
    searchSpecularIssue(id, SUBTASK_KEY, PROJECT_KEY)
  })

  // この段階でID一覧は取得できてる
  logger.i(PROJECT_IDS)

  // ストーリーとサブタスクを自動生成する
  let story = new Story("title", "description", [
      new SubTask("subtask1"),
      new SubTask("subtask2"),
      new SubTask("subtask3")
  ])

  logger.i(story)

})
