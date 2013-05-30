'use strict';

module.exports = {
  docs: {
    files: [
      {
        src: ['fbemitter.min.js', 'JSXTransformer.js'],
        dest: 'docs/js/',
        cwd: 'build/',
        expand: true
      }
    ]
  }
};
