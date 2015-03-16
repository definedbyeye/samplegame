/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


var Display = {
  sd: 1,
  hd: 2,
  hd2: 4
};

var Game = {

  scaleRatio: 1,
  display: Display.sd,

  init: function() {
    this.bind();

    this.initDisplay();
    this.initScaleRatio();

    this.loadRoom('first');

    App.debug('scale: ' + this.scaleRatio + ' display: ' + this.display);

  },

  bind: function() {
  },

  initScaleRatio: function(){
    var parentWidth = $(document).width();
    var parentHeight = $(document).height();
    var objWidth = 2280 / this.display;
    var objHeight = 1440 / this.display;

    var diff = objWidth / parentWidth;
    if ((objHeight / diff) < parentHeight) {
      this.scaleRatio = 1 / (objHeight / parentHeight);
    }
    else {
      this.scaleRatio = 1 / (objWidth / parentWidth);
    }
  },

  initDisplay: function() {
    var display = $(document);

    //default sd
    this.display = Display.sd;

    //detect hd
    if(display.height() > 320 && display.width() > 480) {
      this.display = Display.hd;
    }

    //detect hd2
    if(display.height() > 640 && display.width() > 960) {
      this.display = Display.hd2;
    }
  },

  scale: function(dimension) {
    return (dimension / this.display * this.scaleRatio);
  },

  resize: function($elem, height, width) {
    height = height || $elem.height();
    width = width || $elem.width();

    $elem.css({
      height: this.scale(height) + 'px',
      width:  this.scale(width) + 'px'
    });
  },

  position: function($elem, position) {
    var topOffset = 0;
    var leftOffset = 0;

    if(position == 'center') {

      topOffset = (($elem.height() - $elem.parent().height()) / -2) + parseInt($elem.css('margin-top'));
      leftOffset = (($elem.width() - $elem.parent().width()) / -2) + parseInt($elem.css('margin-left'));

    } else if(typeof(position) == 'object') {

      topOffset = this.scale(position.y);
      leftOffset = this.scale(position.x);
    }

    App.debug('offsets: ' + topOffset + ' by ' + leftOffset);


    $elem.css({
      marginTop: topOffset + 'px',
      marginLeft: leftOffset + 'px'
    });
  },

  loadRoom: function(id) {
    var $room = $('.room');
    var room = Game._rooms[id];

    //reset the room
    $room.empty();

    //set the size and background
    this.resize($room, room.height, room.width);
    this.position($room, room.position);
    $room.css('background-image', 'url(' + room.background + ')');

    //init the layers
    for(var i = 0; i < room.layers.length; i++){
      var $layer = $('<div class="layer">');
      var layer = room.layers[i];

      this.resize($layer, layer.height, layer.width);
      this.position($layer, layer.position);
      $layer.css({'z-index': i});

      //bind events
      for(var j = 0; j < layer.events.length; j++){
        var event = layer.events[j];
        $layer.on(event.name, event.callback.bind(layer));
      }
      $layer.trigger('init');

      $layer.appendTo($room);

    }

  }

};

Game._rooms = {
  'first': {
    name: 'Game Start',
    origin: 'center',
    background: '../img/bg_test_room.png',
    height: 1440,
    width: 2280,
    position: 'center',
    layers: [
      {
        //todo: sprites, sprite classes or references to reusable assets
        images: [
          '../img/sprite_blue_box.png',
          '../img/sprite_red_box.png'
        ],
        height: 235,
        width: 235,
        position: {x:448, y:306},
        events: [ //todo:inherit from a base?
          {name: 'init', callback: function(e) {
              console.log(e.type);
            App.debug(e.type);
            var $layer = $(e.currentTarget);
              var layer = this;
          }},
          {name: 'click', callback: function(e) {
            console.log(e.type);
            App.debug(e.type);
            var $layer = $(e.currentTarget);
            var layer = this;
            $layer.css('background-image', 'none');
          }},
          {name: 'swipeleft', callback: function(e){
            console.log(e.type);
            App.debug(e.type);
            var $layer = $(e.currentTarget);
            var layer = this;
            $layer.css('background-image', 'url('+ layer.images[0] +')');
          }},
          {name: 'swiperight', callback: function(e){
            console.log(e.type);
            App.debug(e.type);
            var $layer = $(e.currentTarget);
            var layer = this;
            $layer.css('background-image', 'url('+ layer.images[1] +')');
          }},
          {name: 'scrollstart', callback: function(e){console.log(e.type)}},
          {name: 'scrollend', callback: function(e){console.log(e.type)}}
        ]
      }/*,
      {
        //todo: sprites or sprite classes
        images: [
          '../img/sprite_blue_box.png',
          '../img/sprite_red_box.png'
        ],
        height: 235,
        width: 235,
        position: {x:600, y:306},
        events: [ //todo:inherit from a base?
          {name: 'init', callback: function(e){console.log(e.type)}},
          {name: 'swipeleft', callback: function(e){console.log(e.type)}},
          {name: 'swiperight', callback: function(e){console.log(e.type)}},
          {name: 'click', callback: function(e){console.log(e.type)}},
          {name: 'scrollstart', callback: function(e){console.log(e.type)}},
          {name: 'scrollend', callback: function(e){console.log(e.type)}}
        ]
      }*/

    ]
  }
};

var App = {

    init: function() {
      this.bindEvents();
    },

    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {

      // todo if it is a device, wait for device ready
      //must happen after deviceready to be bound on devices
      var deviceType = (navigator.userAgent.match(/Chrome/i))  == "Chrome" ? "Chrome" : (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";

      if(deviceType == 'Chrome'){
        $(document).on('ready', function() {Game.init();});
      } else {
        document.addEventListener('deviceready', function(){App.debug('device ready'); Game.init();}, false);
      }

    },

    debug: function(message){
      $('.debug').html(message);
    }

};