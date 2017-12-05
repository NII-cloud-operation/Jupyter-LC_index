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

    function load_desc(indexFiles) {
        var matched = indexFiles.filter(function(indexFile) {
            return (/.md$/i).test(indexFile['name']);
        });
        if(matched.length === 0) {
            console.log('No description: ', indexFiles);
            return;
        }
        $.ajax({
            url: get_content_url(matched[0]['path'])
        }).done(function(data) {
            $('#notebook_index_desc .index_filename').text(matched[0]['name']);
            var panel = $('#notebook_index_desc .index_content');
            panel.empty();
            panel.append($(marked(data)));
            $('#notebook_index_desc').show();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    }

    function load_index(data) {
        var indexFiles = data['content'].filter(function(f) {
            return f['type'] == 'file' && (/^README\.[a-z0-9]+$/i).test(f['name']);
        });
        console.log('Indices: ', indexFiles);
        var matched = indexFiles.filter(function(indexFile) {
            return (/.svg$/i).test(indexFile['name']);
        });
        if(matched.length === 0) {
            console.log('No SVG: ', indexFiles);
            load_desc(indexFiles);
            return;
        }
        $.ajax({
            url: get_content_url(matched[0]['path'])
        }).done(function(data) {
            console.log('SVG loaded', data);
            $('#notebook_index_flow .index_filename').text(matched[0]['name']);
            var panel = $('#notebook_index_flow .index_content');
            panel.empty();
            panel.append($(data.documentElement));
            $('#notebook_index_flow').show();
            load_desc(indexFiles);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
    }

    function generate_panel(suffix) {
        var panel = $('<div></div>');
        panel.attr('id', 'notebook_index_' + suffix);
        panel.addClass('notebook_index');
        var filename = $('<div></div>');
        filename.addClass('index_filename');
        panel.append(filename);
        var content = $('<div></div>');
        content.addClass('index_content');
        panel.append(content);
        panel.hide();
        return panel;
    }

    function load_ipython_extension () {
        $('<link>')
            .attr('rel', 'stylesheet')
            .attr('type', 'text/css')
            .attr('href', require.toUrl('./main.css'))
            .appendTo('head');

        $('#notebook_toolbar').before(generate_panel('flow'));
        $('#notebook_list').after(generate_panel('desc'));

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
