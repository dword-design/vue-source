var defaults = {
  active: 'auto',
  type: 'class',
  debug: true
};

function comment (type, value) {
  return (" " + type + ": " + value + " ")
}

function install (Vue, options) {
  // fake env for browser builds
  var env = typeof process === 'undefined'
    ? 'production'
    : process.env.NODE_ENV;

  // build options
  options = Object.assign(defaults, options);
  options.active = options.active === 'auto'
    ? env !== 'production'
    : !!options.active;

  var type = options.type;
  var active = options.active;
  var debug = options.debug;

  // exits
  if (!['file', 'class', 'tag'].includes(type)) {
    console.warn(("VueSource: invalid option type '" + type + "'"));
    return
  }

  if (!active) {
    return
  }

  Vue.mixin({
    mounted: function mounted () {
      var this$1 = this;

      if (this.$vnode) {
        // variables
        var file = this.$vnode.componentInstance.$options.__file;
        var tag = this.$vnode.componentOptions.tag;
        var auto = (tag
          ? tag
          : file
            ? file.match(/([^/\\]+)\..*?/).pop()
              .replace(/([a-z])([A-Z])/g, function (input, a, b) {
                return (a + '-' + b)
              })
          : 'anonymous'
        )
          .toLowerCase();

        var className = auto.replace(/(^\w|-\w)/g, function (char) { return char.replace('-', '').toUpperCase(); });

        // text
        var text;
        switch (type) {

          case 'file':
            if (file) {
              text = comment('file', file);
            }
            break

          case 'class':
            if (file) {
              var matches = file.match(/([^\\\/]+)\..*?$/);
              text = comment('class', matches[1]);
            }
            else {
              text = comment('class', className);
            }
            break

          case 'tag':
            text = comment('component', auto);
            break
        }

        if (!text) {
          text = comment('component', auto);
        }

        // insert
        if (text) {
          this.__commentLabel = document.createComment(text);
          this.$el.parentNode.insertBefore(this.__commentLabel, this.$el);

          // debug
          if (debug) {
            this.__commentLabel.vm = this;
            this.__commentLabel.tag = tag;
            this.__commentLabel.file = file;
            this.__commentLabel.class = className;
            this.__commentLabel.inspect = function () {
              if (this$1.$inspect) {
                this$1.$inspect();
              }
            };
          }
        }
      }
    },

    destroyed: function destroyed () {
      if (this.__commentLabel) {
        this.__commentLabel.remove();
      }
    }
  });
}

var main = {
  install: install,
  defaults: defaults
};

export default main;
