$(document).ready(function() {
    /* if anything is played, stop everything else */
    $(document).on('play', function(e) {
        if(window.$_currentlyPlaying) {
            window.$_currentlyPlaying.pause();
        }

        if (window.$_currentlyPlaying !== e.target) {
            window.$_currentlyPlaying = e.target;
        }
    });

    searchInit();
    setUpSelectTrack();
});

var favorites = {},
    trackData = {},
    albumList = [];

function searchInit() {
    $('#search-track').click(function () {
        var trackName = $('#track-name').val().replace(' ', '+');
        $.get({
            url: 'https://api.spotify.com/v1/search', //ws.spotify.com/lookup/1/?uri=spotify%3Aartist%3A4YrKBkKSVeqDamzBPWVnSJ",
            data: {
                q: trackName,
                type: 'track'
            },
            dataType: "json",
            success: function (data) {
                console.log(data);
                var tracks = data.tracks.items;
                trackData = {};

                tracks.forEach(function (track) {
                    var artists = [],
                        imgURL = '';

                    if (track.album && track.album.images && track.album.images[0] && track.album.images[0].url) {
                        imgURL = track.album.images[0].url;
                    }

                    track.artists.forEach(function (artist) {
                        artists.push(artist.name);
                    });

                    trackData[track.id] = {
                        id: track.id,
                        name: track.name,
                        preview_url: track.preview_url,
                        img: imgURL,
                        artists: artists
                    };
                })

                $('#select-track').modal('show');
            },
            error: function (error) {
                console.log("whassup noob!");
            }
        });
    });

    $('#songs_tab').click(function () {
        $('.tab-active').removeClass('tab-active');
        $(this).addClass('tab-active');
        $('#album-search').hide();
        $('#song-search').show();
    });

    $('#albums_tab').click(function () {
        $('.tab-active').removeClass('tab-active');
        $(this).addClass('tab-active');
        $('#song-search').hide();
        $('#album-search').show();
    });
}

function setUpSelectTrack() {
    $('#select-track').off().on('show.bs.modal', function () {
        var height = ($(window).height() * .8) - 56 - 65;
        $('#select-track-body').css('max-height', height + 'px');
        $('#select-track-body').html('');

        for (var id in trackData) {
            var track = trackData[id];

            var html = '<div class="row track-container">' +
                '<div value="search_' + track.id + '" class="col-sm-10 audio-btn">' +
                '<div class="row"><div class="col-sm-2"><img class="artist-img" src="' + track.img + '" alt="No Art Work"></div>' +
                '<div class="col-sm-10">Track Name: ' + track.name + '<br><span class="artists">Artist';

            html += (track.artists.length == 1) ? ": " : "s: ";

            if (track.artists && track.artists.length > 0) {
                track.artists.forEach(function (artist) {
                    html += ' ' + artist + ',';
                });

                html = html.slice(0, -1);
            } else {
                html += 'Artist names not provided';
            }

            $(html + '</span></div>' +
                '<audio src="' + track.preview_url + '" class="audio-file" id="search_' + track.id + '-audio"></audio>' +
                '</div></div><div id="search_' + track.id + '" class="col-sm-2 checkmark-box"><span class="checkmark">' +
                '<div class="checkmark_stem"></div><div class="checkmark_kick"></div></span></div></div>')
                .appendTo('#select-track-body');

            $('div[value=search_' + track.id + ']').off().click(function (e) {
                e.stopPropagation();

                var trackId = $(this).attr('value').substr(7);

                var $preview = $('#search_' + trackId + '-audio');

                $('.track-active').removeClass('track-active');
                $(this).addClass('track-active');

                if ($preview[0].paused) {
                    $preview.trigger('play');
                } else {
                    $(this).removeClass('track-active');
                    $preview.trigger('pause');
                }
            });

            if (favorites[track.id] !== null && favorites[track.id] !== undefined) {
                $('#search_' + track.id).addClass('checkmark-box_checked');
                $('#search_' + track.id + ' div.checkmark_stem, #search_' + track.id + ' div.checkmark_kick').addClass('checked');
            }

            $('.checkmark-box').off().click(function (e) {
                e.stopPropagation();

                $(this).addClass('checkmark-box_checked');

                markCheckbox($(this).attr('id').substr(7));

                function markCheckbox(id) {
                    if ($('#search_' + id + ' div.checkmark_stem, #search_' + id + ' div.checkmark_kick').hasClass('checked')) {
                        $('#search_' + id).removeClass('checkmark-box_checked');
                        $('#search_' + id + ' div.checkmark_stem, #search_' + id + ' div.checkmark_kick').removeClass('checked');
                    } else {
                        $('#search_' + id + ' div.checkmark_stem, #search_' + id + ' div.checkmark_kick').addClass('checked');
                    }
                }
            });
        };

        $('</div><div style="clear: both"></div>').appendTo('#select-track-body');
    });

    $('#select-track-save').off().click(function () {
        $('.checkmark-box').each(function () {
            var trackId = $(this).attr('id').substr(7);

            if ( $(this).hasClass('checkmark-box_checked') && (favorites[trackId] === undefined || favorites[trackId] === null) ) {
                var track = trackData[trackId];
                favorites[trackId] = trackData[trackId];

                var html = '<div class="row fav_list" id="fav_' + track.id + '_list"><div class="col-sm-10 audio-btn">' +
                    '<div class="row"><div class="col-sm-2"><img class="artist-img" src="' + track.img + '" alt="No Art Work"></div>' +
                    '<div class="col-sm-10">Track Name: ' + track.name + '<br><span class="artists">Artist';

                html += (track.artists.length == 1) ? ": " : "s: ";

                if (track.artists && track.artists.length > 0) {
                    track.artists.forEach(function (artist) {
                        html += ' ' + artist + ',';
                    });

                    html = html.slice(0, -1);
                } else {
                    html += 'Artist names not provided';
                }

                $(html + '</span></div>' +
                    '<audio src="' + track.preview_url + '" class="audio-file" id="fav_' + track.id + '-audio"></audio>' +
                    '</div></div>' +
                    '<div class="col-sm-2"><button id="fav_' + trackId + '_remove" class="btn btn-danger">Remove</button></div></div>')
                    .appendTo('#favorite_song_list');

                $('#fav_' + track.id + '_remove').click(function () {
                    var trackId = $(this).attr('id').substr(4).slice(0, -7);

                    favorites[trackId] = null;

                    $('#fav_' + trackId + '_list').remove();
                })

                $('#fav_' + track.id + '_list').click(function(e) {
                    e.stopPropagation();

                    var $preview = $('#fav_' + track.id + '-audio');

                    $('.fav_track-active').removeClass('fav_track-active');
                    $(this).addClass('fav_track-active');

                    if ($preview[0].paused) {
                        $preview.trigger('play');
                    } else {
                        $(this).removeClass('fav_track-active');
                        $preview.trigger('pause');
                    }
                });

            } else if (!$(this).hasClass('checkmark-box_checked') && !(favorites[trackId] === undefined || favorites[trackId] === null) ) {
                favorites[trackId] = null;
                $('#fav_' + trackId + '_list').remove();
                $('#fav_' + trackId + '_remove').parent().remove();
            }
        });
    });

    $('#select-track').on('hide.bs.modal', function () {
        if (window.$_currentlyPlaying) {
            window.$_currentlyPlaying.pause();
        }
    });
}
/*
var templateSource = document.getElementById('results-template').innerHTML,
    template = Handlebars.compile(templateSource),
    resultsPlaceholder = document.getElementById('results'),
    playingCssClass = 'playing',
    audioObject = null;

var fetchTracks = function (albumId, callback) {
    $.ajax({
        url: 'https://api.spotify.com/v1/albums/' + albumId,
        success: function (response) {
            callback(response);
        }
    });
};

var searchAlbums = function (query) {
    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        data: {
            q: query,
            type: 'album'
        },
        success: function (response) {
            resultsPlaceholder.innerHTML = template(response);
        }
    });
};

results.addEventListener('click', function (e) {
    var target = e.target;
    if (target !== null && target.classList.contains('cover')) {
        if (target.classList.contains(playingCssClass)) {
            audioObject.pause();
        } else {
            if (audioObject) {
                audioObject.pause();
            }
            fetchTracks(target.getAttribute('data-album-id'), function (data) {
                audioObject = new Audio(data.tracks.items[0].preview_url);
                audioObject.play();
                target.classList.add(playingCssClass);
                audioObject.addEventListener('ended', function () {
                    target.classList.remove(playingCssClass);
                });
                audioObject.addEventListener('pause', function () {
                    target.classList.remove(playingCssClass);
                });
            });
        }
    }
});

document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    searchAlbums(document.getElementById('query').value);
}, false);*/