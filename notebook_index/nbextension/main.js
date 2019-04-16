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

    var mod_name = 'notebook_index';
    var log_prefix = '[' + mod_name + ']';

    var last_tree_url = null;
    var base_href = null;

    function get_tree_url() {
        var baseUrl = utils.get_body_data('baseUrl');
        var path = window.location.href.substring(base_href.length);
        return utils.url_path_join(baseUrl, 'api/contents/' + path);
    }

    function get_content_url(path) {
        var baseUrl = utils.get_body_data('baseUrl');
        return utils.url_path_join(baseUrl, 'files/' + path);
    }

    function get_notebook_url(filename) {
        var baseUrl = utils.get_body_data('baseUrl');
        var path = utils.get_body_data('notebookPath');
        if(path.length > 0) {
            path += '/';
        }
        return utils.url_path_join(baseUrl, 'notebooks/' + path + filename);
    }

    function resolve_url(url, urlType) {
        if((/^https?\:\/\//i).test(url) || (/^\//i).test(url)) {
            return null;
        }
        var baseUrl = utils.get_body_data('baseUrl');
        var path = utils.get_body_data('notebookPath');
        if(path.length > 0) {
            path += '/';
        }
        return utils.url_path_join(utils.url_path_join(baseUrl,
                                                       urlType + '/' + path),
                                   url);
    }

    function load_current_index() {
        $('#notebook_index_flow').hide();
        $('#notebook_index_desc').hide();
        last_tree_url = get_tree_url()
        $.ajax({
            url: last_tree_url + '?type=directory&_=' + (new Date()).getTime()
        }).done(function(data) {
            load_index(data);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error(errorThrown);
        });
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
            var rendered = $(marked(data));
            rendered.find('img').each(function(index) {
                var url = $(this).attr('src');
                var resolvedUrl = resolve_url(url, 'files');
                if(resolvedUrl != null) {
                    console.log('image url', resolvedUrl);
                    $(this).attr('src', resolvedUrl);
                }
            });
            rendered.find('a').each(function(index) {
                var url = $(this).attr('href');
                var resolvedUrl = resolve_url(url, 'notebooks');
                if(resolvedUrl != null) {
                    console.log('link url', resolvedUrl);
                    $(this).attr('href', resolvedUrl);
                }
                $(this).attr('target', '_blank');
            });
            panel.append(rendered);
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
            var anchors = data.getElementsByTagName('a');
            for(var i = 0; i < anchors.length; i ++) {
                var anchor = anchors.item(i);
                var url = anchor.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
                anchor.setAttributeNS('http://www.w3.org/1999/xlink', 'href',
                                      get_notebook_url(url));
                anchor.setAttribute('target', '_blank');
            }
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
        content.addClass('index_content').addClass('rendered_html');
        panel.append(content);
        panel.hide();
        return panel;
    }

    function scan_tree() {
        var current_tree_url = get_tree_url();
        if (current_tree_url != last_tree_url) {
            load_current_index();
        }
    }

    function get_base_path() {
        var first_href = window.location.href;
        var hash_pos = first_href.indexOf('#');
        if (hash_pos >= 0) {
            first_href = first_href.substring(0, hash_pos);
        }
        var notebook_path = utils.get_body_data('notebookPath');
        console.log(log_prefix, 'URL: windown.location.href=' + first_href +
                    ', notebookPath=' + notebook_path);
        var decoded_href = decodeURI(first_href);
        var last = decoded_href.substring(decoded_href.length - notebook_path.length);
        if (last != notebook_path) {
            console.error(log_prefix, 'Unexpected path: ' + last +
                          ' (Expected: ' + notebook_path + ')');
            return null;
        }
        var encoded_path = encodeURI(notebook_path);
        return first_href.substring(0, first_href.length - encoded_path.length);
    }

    function load_ipython_extension () {
        $('<link>')
            .attr('rel', 'stylesheet')
            .attr('type', 'text/css')
            .attr('href', require.toUrl('./main.css'))
            .appendTo('head');

        $('#notebook_toolbar').before(generate_panel('flow'));
        $('#notebook_list').after(generate_panel('desc'));

        base_href = get_base_path();
        if (base_href == null) {
            return;
        }
        console.log(log_prefix, 'Base URL: ' + base_href);
        load_current_index();
        $("#notebook_list").bind("DOMSubtreeModified", function() {
            scan_tree();
        });
    }

    return {
        load_ipython_extension: load_ipython_extension
    };

});
