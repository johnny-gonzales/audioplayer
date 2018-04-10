/**
 * Audio Player
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2016-2017 Marcel Scherello
 */

Audios.prototype.showSidebar = function (evt) {

    var trackid = $(evt.target).closest('li').attr('data-trackid');
    var fileid = $(evt.target).closest('li').attr('data-fileid');
    var $appsidebar = $("#app-sidebar");

    if ($appsidebar.data('trackid') === trackid) {
        $appsidebar.data('trackid', '');
        $this.hideSidebar();
    } else {
        $(".tabHeaders").empty();
        $(".tabsContainer").empty();
        $appsidebar.data('trackid', trackid);
        var getcoverUrl = OC.generateUrl('apps/audioplayer/getcover/');
        var trackData = $("li[data-trackid='" + trackid + "']");
        var cover = trackData.attr('data-cover');

        if (cover !== '') {
            $('.thumbnailContainer').addClass('large');
            $('#sidebarThumbnail').attr({
                'style': 'background-image:url(' + getcoverUrl + cover + ')'
            });
        } else {
            $('.thumbnailContainer').removeClass('large');
            $('#sidebarThumbnail').attr({
                'style': ''
            });
        }

        $('#sidebarTitle').html(trackData.attr('data-title'));
        $('#sidebarMime').html(trackData.attr('data-mimetype'));

        $('#sidebarFavorite').attr({'data-fileid': fileid})
            .on('click', $this.favoriteUpdate.bind($this));
        $('#sidebarClose').click($this.hideSidebar.bind($this));

        $this.registerAudioplayerTab();
        $this.registerID3EditorTab();
        $this.registerPlaylistsTab();

        $this.audioplayerTabView();
        // noinspection JSUnresolvedFunction
        OC.Apps.showAppSidebar();
    }
};

Audios.prototype.registerPlaylistsTab = function () {
    var li = $('<li/>').addClass('tabHeader')
        .attr({
            'id': 'tabHeaderPlaylists',
            'data-tabid': '3',
            'data-tabindex': '3'
        });
    var atag = $('<a/>').text(t('audioplayer', 'Playlists'));
    li.append(atag);
    $('.tabHeaders').append(li);

    var div = $('<div/>').addClass('tab playlistsTabView')
        .attr({
            'id': 'playlistsTabView'
        });
    $('.tabsContainer').append(div);

    $('#tabHeaderPlaylists').click($this.playlistsTabView.bind($this));
};

Audios.prototype.registerAudioplayerTab = function () {
    var li = $('<li/>').addClass('tabHeader')
        .attr({
            'id': 'tabHeaderAudiplayer',
            'data-tabid': '1',
            'data-tabindex': '1'
        });
    var atag = $('<a/>').text(t('audioplayer', 'Audio Player'));
    li.append(atag);
    $('.tabHeaders').append(li);

    var div = $('<div/>').addClass('tab audioplayerTabView')
        .attr({
            'id': 'audioplayerTabView'
        });
    $('.tabsContainer').append(div);

    $('#tabHeaderAudiplayer').click($this.audioplayerTabView.bind($this));
};

Audios.prototype.registerID3EditorTab = function () {
    var li = $('<li/>').addClass('tabHeader')
        .attr({
            'id': 'tabHeaderID3Editor',
            'data-tabid': '2',
            'data-tabindex': '2'
        });
    var atag = $('<a/>').text(t('audioplayer', 'ID3 Editor'));
    li.append(atag);
    $('.tabHeaders').append(li);

    var div = $('<div/>').addClass('tab ID3EditorTabView')
        .attr({
            'id': 'ID3EditorTabView'
        });
    $('.tabsContainer').append(div);

    if ($('#audioplayer_editor').val() === 'true') {
        $('#tabHeaderID3Editor').click($this.APEditorTabView.bind($this));
    } else {
        $('#tabHeaderID3Editor').click($this.ID3EditorTabView.bind($this));
    }
};

Audios.prototype.hideSidebar = function () {
    // noinspection JSUnresolvedFunction
    OC.Apps.hideAppSidebar();
    $(".tabHeaders").empty();
    $(".tabsContainer").empty();
};

Audios.prototype.audioplayerTabView = function () {
    var trackid = $("#app-sidebar").data('trackid');

    $this.resetView();
    $('#tabHeaderAudiplayer').addClass('selected');
    $('#audioplayerTabView').removeClass('hidden').html('<div style="text-align:center; word-wrap:break-word;" class="get-metadata"><p><img src="' + OC.imagePath('core', 'loading.gif') + '"><br><br></p><p>' + t('audioplayer', 'Reading data') + '</p></div>');

    $.ajax({
        type: 'GET',
        url: OC.generateUrl('apps/audioplayer/getaudioinfo'),
        data: {trackid: trackid},
        success: function (jsondata) {
            if (jsondata.status === 'success') {

                var table = $('<div>').css('display', 'table').addClass('table');
                var tablerow;
                var m;
                var tablekey;
                var tablevalue;

                var audioinfo = jsondata.data;
                for (m in audioinfo) {
                    tablerow = $('<div>').css('display', 'table-row');
                    tablekey = $('<div>').addClass('key').text(t('audioplayer', m));
                    tablevalue = $('<div>').addClass('value')
                        .text(audioinfo[m]);
                    tablerow.append(tablekey).append(tablevalue);

                    if (m === 'fav' && audioinfo[m] === 't') {
                        $('#sidebarFavorite').removeClass('icon-star')
                            .addClass('icon-starred')
                            .prop('title', t('files', 'Favorited'));
                        audioinfo[m] = '';
                    } else if (m === 'fav') {
                        $('#sidebarFavorite').removeClass('icon-starred')
                            .addClass('icon-star')
                            .prop('title', t('files', 'Favorite'));
                        audioinfo[m] = '';
                    }

                    if (audioinfo[m] !== '') {
                        table.append(tablerow);
                    }
                }
            } else {
                table = t('audioplayer', 'No Data');
            }

            $('#audioplayerTabView').html(table);
        }
    });
};

Audios.prototype.playlistsTabView = function () {
    var trackid = $("#app-sidebar").data('trackid');

    $this.resetView();
    $('#tabHeaderPlaylists').addClass('selected');
    $('#playlistsTabView').removeClass('hidden').html('<div style="text-align:center; word-wrap:break-word;" class="get-metadata"><p><img src="' + OC.imagePath('core', 'loading.gif') + '"><br><br></p><p>' + t('audioplayer', 'Reading data') + '</p></div>');

    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/audioplayer/getplaylists'),
        data: {trackid: trackid},
        success: function (jsondata) {
            if (jsondata.status === 'success') {

                var table = $('<div>').css('display', 'table').addClass('table');
                var tablerow;
                var m;
                var tablekey;
                var tablevalue;

                var audioinfo = jsondata.data;
                for (m in audioinfo) {
                    var spanDelete = $('<a/>').attr({
                        'class': 'icon icon-delete toolTip',
                        'data-listid': audioinfo[m]['playlist_id'],
                        'data-trackid': trackid,
                        'title': t('audioplayer', 'Remove')
                    }).click($this.removeSongFromPlaylist.bind($this));

                    tablerow = $('<div>').css('display', 'table-row').attr({'data-id': audioinfo[m]['playlist_id']});
                    tablekey = $('<div>').addClass('key').append(spanDelete);

                    tablevalue = $('<div>').addClass('value')
                        .text(audioinfo[m]['name']);
                    tablerow.append(tablekey).append(tablevalue);
                    table.append(tablerow);
                }
            } else {
                table = t('audioplayer', 'No Data');
            }

            $('#playlistsTabView').html(table);
        }
    });

};

Audios.prototype.ID3EditorTabView = function () {
    $this.resetView();
    $('#tabHeaderID3Editor').addClass('selected');
    $('#ID3EditorTabView').removeClass('hidden').html('<div style="text-align:center; word-wrap:break-word;" class="get-metadata"><p>' + t('audioplayer', 'No ID3 Editor installed') + '</p></div>');
};

Audios.prototype.resetView = function () {
    $('#tabHeaderAudiplayer').removeClass('selected');
    $('#tabHeaderPlaylists').removeClass('selected');
    $('#tabHeaderID3Editor').removeClass('selected');
    $('#audioplayerTabView').addClass('hidden');
    $('#playlistsTabView').addClass('hidden');
    $('#ID3EditorTabView').addClass('hidden');
};

Audios.prototype.removeSongFromPlaylist = function (evt) {

    var trackid = $(evt.target).attr('data-trackid');
    var playlist = $(evt.target).attr('data-listid');

    $.ajax({
        type: 'POST',
        url: OC.generateUrl('apps/audioplayer/removetrackfromplaylist'),
        data: {
            'playlistid': playlist,
            'songid': trackid
        },
        success: function (jsondata) {
            if (jsondata === true) {
                var currentCount = $('#myCategory li[data-id="' + playlist + '"]').find('.counter');
                currentCount.text(currentCount.text() - 1);
                $('#playlistsTabView div[data-id="' + playlist + '"]').remove()
            }
        }
    });
};