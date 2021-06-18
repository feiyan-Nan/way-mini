const OldPage = Page
Page = (...rest) => {
  const [ options ] = rest
  const { onLoad: pageOnLoad, onShow: pageOnShow } = options
  // Object.keys(options).forEach(key => {
  //   key.startsWith('on') ? console.log('key', key) : null
  // })

  options.onLoad = function(opt) {
    console.log('---------', this)
    pageOnLoad && pageOnLoad.call(this, opt)
  }

  options.onShow = function(opt) {
    console.log('++++++++')
    pageOnShow && pageOnShow.call(this, opt)
  }



  OldPage(options)
}