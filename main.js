/**
 * Created by justinbrunner on 2/6/17.
 */

$(document).ready(function() {
    var favorites = [];

    $(document).on('play', function(e) {
        if(window.$_currentlyPlaying) {
            window.$_currentlyPlaying.pause();
        }

        if (window.$_currentlyPlaying !== e.target) {
            window.$_currentlyPlaying = e.target;
        }
    });

    $('[data-toggle="tooltip"]').tooltip();


    $('#search-track').unbind().click(function() {
        var trackName = $('#track-name').val().replace(' ', '+');
        $.get({
            url: 'https://api.spotify.com/v1/search', //ws.spotify.com/lookup/1/?uri=spotify%3Aartist%3A4YrKBkKSVeqDamzBPWVnSJ",
            data: {
                q: trackName,
                type: 'track'
            },
            dataType: "json",
            success: function(data) {
                var tracks = data.tracks.items;

                $('#select-track').on('show.bs.modal', function() {
                    var height = ($(window).height() * .8) - 56 - 65;
                    $('#select-track-body').css('max-height', height + 'px');
                    $('#select-track-body').html('');

                    tracks.forEach(function(track) {
                        if (track.album.images[0] && track.album.images[0].url) {
                            var image = track.album.images[0].url;
                        } else {
                            var image = '';
                        }

                        var html = '<div class="row track-container">' +
                            '<div value="' + track.id + '" class="col-sm-10 audio-btn">' +
                            '<div class="row"><div class="col-sm-2"><img class="artist-img" src="' + image + '" alt="No Art Work"></div>' +
                            '<div class="col-sm-10">Track Name: ' + track.name + '<br><span id="artists">Artist';

                        if (track.artists.length == 1) {
                            html += ": ";
                        } else {
                            html += "s: ";
                        }

                        if (track.artists && track.artists.length > 0) {
                            track.artists.forEach(function (artist) {
                                html += ' ' + artist.name + ',';
                            });

                            html = html.slice(0, -1);
                        } else {
                            html += 'Artist names not provided';
                        }

                        $(html + '</span></div>' +
                            '<audio src="' + track.preview_url + '" class="audio-file" id="' + track.id + '-audio"></audio>' +
                            '</div></div><div id="' + track.id + '" class="col-sm-2 checkmark-box"><span class="checkmark">' +
                            '<div class="checkmark_stem"></div>' +
                            '<div class="checkmark_kick"></div>' +
                            '</span><!--input type="checkbox" /--></div></div>')
                            .appendTo('#select-track-body');

                        $('div[value=' + track.id + ']').unbind().click(function (e) {
                            e.stopPropagation();

                            var $preview = $('#' + track.id + '-audio');

                            $('.track-active').removeClass('track-active');
                            $(this).addClass('track-active');

                            if ($preview[0].paused) {
                                $preview.trigger('play');
                            } else {
                                $(this).removeClass('track-active');
                                $preview.trigger('pause');
                            }
                        });

                        if (favorites.includes(track.id)) {
                            $('#' + track.id).addClass('checkmark-box_checked');
                            $('#' + track.id + ' div.checkmark_stem, #' + track.id + ' div.checkmark_kick').addClass('checked');
                        }

                        $('.checkmark-box').unbind().click(function(e) {
                            e.stopPropagation();

                            $(this).addClass('checkmark-box_checked');

                            markCheckbox($(this).attr('id'));

                            function markCheckbox(id) {
                                if ($('#' + id + ' div.checkmark_stem, #' + id + ' div.checkmark_kick').hasClass('checked')) {
                                    $('#' + id).removeClass('checkmark-box_checked');
                                    $('#' + id + ' div.checkmark_stem, #' + id + ' div.checkmark_kick').removeClass('checked');
                                } else {
                                    $('#' + id + ' div.checkmark_stem, #' + id + ' div.checkmark_kick').addClass('checked');
                                }
                            }
                        });
                    });

                    $('</div><div style="clear: both"></div>').appendTo('#select-track-body');

                    $('#select-track-save').click(function() {
                        $('.checkmark-box').each(function() {
                            trackId = $(this).attr('id');

                            if ($(this).hasClass('checkmark-box_checked') && !favorites.includes(trackId)) {
                                favorites.push(trackId);

                                $('<div id="' + trackId + '_favorite_list" class="col-sm-10">' + $('div[value=' + trackId + ']').html() + '</div>' +
                                    '<div class="col-sm-2"><button id="' + trackId + '_remove" class="btn btn-danger">Remove</button></div>')
                                    .appendTo('#favorite_song_list');

                                $('#' + trackId + '_remove').click(function() {
                                    var trackId = $(this).attr('id').slice(0, -7);
                                    var trackIdx = favorites.indexOf(trackId);

                                    if (trackIdx > -1) {
                                        favorites.splice(trackIdx, 1);
                                    }
                                    $('#' + trackId + '_favorite_list').remove();
                                    $(this).parent().remove();
                                })

                            } else if (!$(this).hasClass('checkmark-box_checked') && favorites.includes(trackId)) {
                                var trackIdx = favorites.indexOf(trackId);

                                if (trackIdx > -1) {
                                    favorites.splice(trackIdx, 1);
                                }
                                $('#' + trackId + '_favorite_list').remove();
                                $('#' + trackId + '_remove').parent().remove();
                            }
                        });
                    });
                });

                $('#select-track').on('hide.bs.modal', function() {
                    if(window.$_currentlyPlaying) {
                        window.$_currentlyPlaying.pause();
                    }
                });


                $('#select-track').modal('show');
            },
            error: function(error) {
                console.log("here");
            }
        })
    });

    $('#songs_tab').click(function() {
        $('.tab-active').removeClass('tab-active');
        $(this).addClass('tab-active');
        $('#album-search').hide();
        $('#song-search').show();
    });

    $('#albums_tab').click(function() {
        $('.tab-active').removeClass('tab-active');
        $(this).addClass('tab-active');
        $('#song-search').hide();
        $('#album-search').show();
    });
});