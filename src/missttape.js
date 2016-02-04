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

