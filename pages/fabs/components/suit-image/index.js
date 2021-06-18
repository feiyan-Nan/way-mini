Component({
  properties: {
    info: Object,
    index: Number
  },
  observers: {
    index (val) {
      // console.log('index', val)
    },
    info(val) {
      // console.log('info-------------', val)
      const { index } = this.properties
      const { parentStyle, localStyle } = val

      const normal = {
        mode: 'widthFix',
        style: 'width: 100%;left: 0;top: 0;'
      }

      const shangxia = {
        mode: 'widthFix',
        style: 'width: 100%;left: 0;top: 50%;transform: translateY(-50%)'
        // style: 'width: 100%;left: 0;top: 50%;'
      }

      const zuoyou = {
        mode: 'heightFix',
        style: 'height: 100%;left: 50%;top: 0;transform: translateX(-50%)'
      }

      let params
      if (index === 0) {
        params = localStyle === 'hengtu' ? zuoyou : normal
      } else {
        if (parentStyle === 'bili' || parentStyle === 'changtu') {
          switch (localStyle) {
            case 'bili':
              params = normal
              break
            case 'feibili':
              params = zuoyou
              break
            case 'zishiying':
              params = zuoyou
              break
            case 'changtu':
              params = zuoyou
              break
            default:
              params = shangxia
          }
        }


        if (parentStyle === 'fangtu' || parentStyle === 'hengtu') {
          switch (localStyle) {
            case 'fangtu':
              params = normal
              break
            case 'hengtu':
              params = shangxia
              break
            default:
              params = zuoyou
          }
        }
        if (parentStyle === 'zishiying') {
          switch (localStyle) {
            case 'fangtu':
              params = shangxia
              break
            case 'hengtu':
              params = shangxia
              break
            case 'zishiying':
              params = zuoyou
              break
            default:
              params = zuoyou
          }
        }
      }

      // console.log('params-----------------', params)
      // console.log('val-----------------', val)

      this.setData({ params })
    }
  },
  data: {
    params: null,
    opacity: 0
  },
  methods: {
    load () {
      this.setData({
        opacity: 1
      })
    }
  }
});
