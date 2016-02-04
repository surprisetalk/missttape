"use strict";

// this -> Missttape
$.fn.Missttape = function()
{
    return new Missttape( $(this) );
};

class Missttape
{
    // jquery -> Missttape
    constructor( a_$container )
    {
	this._my_$container = a_$container;
	this._set_my_tracks( [], null, [] );
    }

    // list of Tracks, Track, list of Tracks -> Missttape
    _set_my_tracks( my_prev_tracks, my_current_track, my_next_tracks )
    {
	this._my_prev_tracks = my_prev_tracks;
	this._my_current_track = my_current_track;
	this._my_next_tracks = my_next_tracks;
	this._is_playing = false;
	return this;
    }

    // list of strings -> Missttape
    links( some_links )
    {
	var some_tracks = some_links.map( Track_gen( this._my_$container ) );
	some_tracks[0].load();
	this._set_my_tracks( [], some_tracks.length ? some_tracks[0] : null, some_tracks.splice(1) )
	return this;
    }

    is_playing()
    {
	return this._is_playing;
    }

    // -> Missttape
    play()
    {
	this._is_playing = true;
	var that = this;
	var play_next = function() { that.next().play() };
	this._my_current_track.play( play_next );
	return this;
    }

    // -> Missttape
    pause()
    {
	this._is_playing = false;
	this._my_current_track.pause();
	return this;
    }

    // -> Missttape
    next()
    {
	if( this._my_current_track )
	    this._my_prev_tracks.push( this._my_current_track );
	this._my_current_track = this._my_next_tracks.length
	    ? this._my_next_tracks.shift()
	    : null;
	this._my_current_track.load().play()
	return this;
    }

    // -> Missttape
    prev()
    {
	if( this._my_current_track )
	if( this._my_current_track )
	    this._my_next_tracks.unshift( this._my_current_track );
	this._my_current_track = this._my_prev_tracks.length
	    ? this._my_prev_tracks.pop()
	    : null;
	this._my_current_track.load().play()
	return this;
    }

    // -> Missttape
    load()
    {
	this._is_playing = false;
	if( this._my_current_track )
	this._my_current_track.load();
	return this;
    }
}

"use strict";

// function ->
function callbacker( callback )
{
    if( typeof callback === "function" )
	callback();
}

// jquery -> function( string -> Track )
function Track_gen( a_$container )
{
    return function( a_url )
    {
	// todo spotify, reddit, facebook
	if( a_url.includes( "youtube.com" ) )
	    return new YouTube( a_$container, a_url );
	else if( a_url.includes( "soundcloud.com" ) )
	    return new SoundCloud( a_$container, a_url );
	else
	    return new WebPage( a_$container, a_url );
    };
}

class Track
{
    // string -> Track
    constructor( a_$container, a_url )
    {
	this._my_$container = a_$container;
	this._my_url = a_url;
    }

    // [ function ] -> Track
    load( callback )
    {
	this._my_$container.empty().append( $( "<p>", { text: "sorry, we couldn't fetch that url" } ) );
	callbacker( callback );
	return this;
    }

    // [ function ] -> Track
    play( callback )
    {
	callbacker( callback );
	return this;
    }

    // [ function ] -> Track
    pause( callback )
    {
	callbacker( callback );
	return this;
    }
}

// string, [ object ] -> jquery
function $iframer( a_url, options )
{
    // todo embed vs iframe
    if( typeof options === "undefined" ) options = {};
    return $( "<iframe>", $.extend( { src: a_url, frameborder: "0", width: "100%" }, options ) );
}

// int -> function
$.fn.scroller = function( dy )
{
    var that = this;
    return function()
    {
	that.css(
	    {
		"margin-top": ~~that.css('margin-top').slice(0,-2) - dy + "px",
		"height": ~~that.css('height').slice(0,-2) + dy + "px" 
	    }
	);
    };
}

class WebPage extends Track
{
    // [ function ] -> Track
    load( callback )
    {
	// todo unfluff
	this._my_$iframe = $iframer( this._my_url, { height: document.height - this._my_$container.offset().top } );
	this._my_$container.empty().append( this._my_$iframe );
	callbacker( callback );
	return this;
    }
    
    // [ function ] -> Track
    play( callback )
    {
	var scroll_rate = 25;
	if( typeof this.intervalometer === "undefined" )
	    this.intervalometer = setInterval( this._my_$iframe.scroller( 1 ), scroll_rate );
	//callbacker( callback );
	return this;
    }

    // [ function ] -> Track
    pause( callback )
    {
	clearInterval( this.intervalometer );
	this.intervalometer = undefined;
	// callbacker( callback );
	return this;
    }
}

// str -> { str: str, ... }
function parseQuery( qstr )
{
    var query = {};
    var a = qstr.split('?')[1].split('&');
    for( var i = 0; i < a.length; i++ )
    {
	var b = a[i].split('=').map( decodeURIComponent );
	query[ b[0] ] = b[1] || '';
    }
    return query;
}

class YouTube extends Track
{
    // function -> function( event -> )
    _on_player_ready_gen( callback )
    {
	return function( event )
	{
	    event.target.setPlaybackRate( 1.5 );
	    event.target.playVideo();
	    callbacker( callback );
	}
    }

    // int, function ->
    _load_player( video_id, callback )
    {
	this._my_player = new YT.Player(
	    "player",
	    {
		height: document.height - this._my_$container.offset().top,
		width: '100%',
		videoId: video_id,
		events: {
		    'onReady': this._on_player_ready_gen( callback ),
		    'onStateChange': window.onPlayerStateChange
		}
	    }
	);
    }

    // [ function ] -> Track
    load( callback )
    {
	this._my_$container.empty().append( $( "<div>", { id: "player" } ) );
	var video_id = parseQuery( this._my_url )['v'];
	var that = this;
	if( typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined' )
	{
	    // http://stackoverflow.com/questions/16050024/youtube-iframe-api-fails-to-post-message
	    // https://github.com/okfocus/okvideo/issues/25
	    window.onYouTubeIframeAPIReady = function() {
		that._load_player( video_id, callback );
	    };
	    $.getScript('https://www.youtube.com/iframe_api');

	} else {

	    this._load_player( video_id );
	}
	return this;
    }

    // [ function ] -> Track
    play( callback )
    {
	var that = this;
	return new Promise( function( resolve, reject )
	{
	    window.onPlayerStateChange = function( event )
	    {
		if( !event.data ) callbacker( callback );
	    };
	    if( typeof that._my_player !== "undefined" )
		that._my_player.playVideo();
	});
	return this;
    }

    // [ function ] -> Track
    pause( callback )
    {
	if( typeof this._my_player !== "undefined" )
	    this._my_player.pauseVideo();
	callbacker( callback );
	return this;
    }

}

// client_id: e2d75b7a25540ee316e2eea74437a
class SoundCloud extends Track
{
    // [ function ] -> Track
    load( callback )
    {
	this._my_$iframe = $iframer(
	    "https://w.soundcloud.com/player/?url=" + encodeURIComponent( this._my_url ) + "&amp;auto_play=true&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true",
	    {
		height: document.height - this._my_$container.offset().top,
		allowtransperency: "true",
		scrolling: "no",
		frameborder: "no"
	    }
	);
	this._my_$container.empty().append( this._my_$iframe );
	callbacker( callback );
	return this;
    }

    // [ function ] -> Track
    play( callback )
    {
	//callbacker( callback );
	return this;
    }

    // [ function ] -> Track
    pause()
    {
	//callbacker( callback );
	return this;
    }

    /*
      see https://developers.soundcloud.com/docs/widget#parameters
      <object height="81" width="100%">
  <param name="movie"
    value="http://player.soundcloud.com/player.swf?{ ADD YOUR PARAMETERS HERE }&url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293"></param>
  <param name="allowscriptaccess" value="always"></param>
  <embed
    src="http://player.soundcloud.com/player.swf?{ ADD YOUR PARAMETERS HERE }&url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F293"
    allowscriptaccess="always" height="81"  type="application/x-shockwave-flash" width="100%">
  </embed>
</object>
    */
    /*
<!doctype html>
<html>
<head>
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
  <script src="http://w.soundcloud.com/player/api.js"></script>
  <script>
   $(document).ready(function() {
     var widget = SC.Widget(document.getElementById('soundcloud_widget'));
     widget.bind(SC.Widget.Events.READY, function() {
       console.log('Ready...');
     });
     $('button').click(function() {
       widget.toggle();
     });
   });
  </script>
</head>
<body>
  <iframe id="soundcloud_widget"
      src="http://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/39804767&show_artwork=false&liking=false&sharing=false&auto_play=true"
      width="420"
      height="120"
      frameborder="no"></iframe>
  <button>Play / Pause</button>
</body>
</html>
*/
    
}

