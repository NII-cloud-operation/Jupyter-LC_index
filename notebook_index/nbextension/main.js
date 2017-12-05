define([
  'jquery',
  'base/js/namespace',
  'base/js/utils',
  'require',
  'components/marked/lib/marked'
], function(
  $,
  Jupyter,
  utils,
  require,
  marked
) {
    "use strict";

    function get_tree_url() {
        var baseUrl = utils.get_body_data('baseUrl');
        var path = utils.get_body_data('notebookPath');
        return utils.url_path_join(baseUrl, 'api/contents/' + path);
    }

    function get_content_url(path) {
        var baseUrl = utils.get_body_data('baseUrl');
        return utils.url_path_join(baseUrl, 'files/' + path);
    }

    function get_renderer(f) {
        if(f['type'] == 'file') {
            if((/.md$/i).test(f['name'])) {
                return {'priority': 1,
                        'renderer': function(data) {
                            return $(marked(data));
                        }};
            }
        }
        return null;
    }

    function load_index(data) {
        var indexFiles = data['content'].filter(function(f) {
            return (/^README\.[a-z0-9]+$/i).test(f['name']);
        });
        if(indexFiles.length == 0) {
            console.log('No Index');
            return;
        }
        console.log('Indices: ', indexFiles);
        var renderers = indexFiles.map(function(indexFile) {
            var r = get_renderer(indexFile);
            if(r === null) {
                return {'file': indexFile,
                        'priority': null,
                        'renderer': null};
            }else{
                return {'file': indexFile,
                        'priority': r['priority'],
                        'renderer': r['renderer']};
            }
        }).filter(function(r) {
            return r['renderer'] !== null;
        }).sort(function(af, bf) {
            var a = af['priority'];
            var b = af['priority'];
            if(a < b) {
                return -1;
            }else if(a > b) {
                return 1;
            }else{
                return 0;
            }
        });
        if(renderers.length === 0) {
            console.log('Unsupported index file: ', indexFiles);
            return;
        }
        var indexFile = renderers[0]['file'];
        var renderer = renderers[0]['renderer'];
        $.ajax({
            url: get_content_url(indexFile['path'])
        }).done(function(data) {
            $('#notebook_index .index_filename').text(indexFile['name']);
            var panel = $('#notebook_index .index_content');
            panel.empty();
            panel.append(renderer(data));
            $('#notebook_index').show();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    }

    function load_ipython_extension () {
        $('<link>')
            .attr('rel', 'stylesheet')
            .attr('type', 'text/css')
            .attr('href', require.toUrl('./main.css'))
            .appendTo('head');

        var panel = $('<div></div>');
        panel.attr('id', 'notebook_index');
        var filename = $('<div></div>');
        filename.addClass('index_filename');
        panel.append(filename);
        var content = $('<div></div>');
        content.addClass('index_content');
        panel.append(content);
        panel.hide();
        $('#notebooks').append(panel);

        $.ajax({
            url: get_tree_url() + '?type=directory&_=' + (new Date()).getTime()
        }).done(function(data) {
            load_index(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    }

    return {
        load_ipython_extension: load_ipython_extension
    };

});
