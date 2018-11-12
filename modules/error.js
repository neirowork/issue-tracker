module.exports = (error = null) => {

  return {

    EOTHER: {
      code: 'EOTHER',
      readable: '何らかのエラーが発生しました',
      error
    },
    ECOMMIT_JSON: {
      code: 'ECOMMIT_JSON',
      readable: 'JSONのコミット中にエラーが発生しました',
      error
    },
    EUNDEFINED_OPERATION: {
      code: 'EUNDEFINED_OPERATION',
      readable: '定義されていない操作が行われました'
    },
    ENOT_ISSUE_CHANNEL: {
      code: 'ENOT_ISSUE_CHANNEL',
      readable: 'Issueのチャンネルはありません'
    }

  }
  
}