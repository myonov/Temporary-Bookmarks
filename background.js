var addBookmark = function (node) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(tabarray) {
    var tab = tabarray[0]
    chrome.bookmarks.create({
      parentId: node.id,
      title: tab.title,
      url: tab.url
    })
  })
}

var getParentAndTemp = function(treeNodes) {
  var i, j
  var parent = null
  var temp = null

  for (i = 0; i < treeNodes.length; ++i) {
    if ( treeNodes[i].children ) {
      for (j = 0; j < treeNodes[i].children.length; ++j) {
        if ( treeNodes[i].children[j].title == 'Bookmarks bar') {
          parent = treeNodes[i].children[j]
          break
        }
      }
    }
  }

  if ( parent == null ) {
    console.log('No bookmarks bar - no idea why')
  }

  for (i = 0; i < parent.children.length; ++i) {
      if ( parent.children[i].title == 'temp' ) {
        temp = parent.children[i]
      }
  }

  return [parent, temp]
}

chrome.commands.onCommand.addListener(function(command) {
  chrome.bookmarks.getTree(function(treeNodes) {
    var i, j
    var tmp = getParentAndTemp(treeNodes)
    var parent = tmp[0]
    var temp = tmp[1]

    if ( temp == null ) {
      chrome.bookmarks.create({
        parentId: parent.id,
        title: 'temp'
      }, function (node) {
          addBookmark(node)
      })
    } else {
      addBookmark(temp)
    }
  })
})

chrome.runtime.onMessage.addListener(function(request, sender, response) {
  var bresp = false
  chrome.bookmarks.getTree(function(treeNodes) {
    var tmp = getParentAndTemp(treeNodes)
    var parent = tmp[0]
    var temp = tmp[1]
    var i

    if ( temp == null ) {
      return
    }

    for (i = 0; i < temp.children.length; ++i) {
      if ( temp.children[i].url == request.location ) {
        chrome.bookmarks.remove(temp.children[i].id, function() {
          response({"success": true, "status": "removed"})
          bresp = true
        })
      }
    }
  })
  if ( !bresp ) {
    response({"success": true, "status": "not-found"})
  }
})
