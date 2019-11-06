/*global $, ReconnectingWebSocket */

var pubsub = (function ($, ReconnectingWebSocket) {

    var backend = {};

    var PubSub = (function () {

        var PubSub = function () {
            if (!(this instanceof PubSub)) {
                return new PubSub();
            }
            this._subscribers = [];
        };

        PubSub.prototype.subscribe = function (handler, type, context) {
            type = type || "any";
            if (typeof context === "undefined") {
                context = handler;
            }
            if (typeof this._subscribers[type] === "undefined") {
                this._subscribers[type] = [];
            }
            this._subscribers[type].push(handler.bind(context));
        };

        PubSub.prototype.unsubscribe = function (handler, type) {
            this._visitSubscribers("unsubscribe", handler, type);
        };

        PubSub.prototype.publish = function (publication, type) {
            this._visitSubscribers("publish", publication, type);
        };

        PubSub.prototype._visitSubscribers = function (action, arg, type) {
            var pubtype = type || "any",
                subscribers,
                max,
                i;

            subscribers = this._subscribers[pubtype];
            if (! subscribers) {
                return;
            }
            max = subscribers.length;

            for (i = 0; i < max; i += 1) {
                if (action === "publish") {
                    subscribers[i](arg);
                } else {
                    if (subscribers[i] === arg) {
                        subscribers.splice(i, 1);
                    }
                }
            }
        };
        return PubSub;
    }());

    backend.Socket = (function () {
        var makeSocket = function (endpoint, channel, tolerance) {
            var ws_scheme = (window.location.protocol === "https:") ? "wss://" : "ws://",
                app_root = ws_scheme + location.host + "/",
                socket;

            socket = new ReconnectingWebSocket(
                app_root + endpoint + "?channel=" + channel + "&tolerance=" + tolerance
            );
            socket.debug = true;

            return socket;
        };

        var parse = function (self, event) {
            var marker = self.broadcastChannel + ":";
            if (event.data.indexOf(marker) !== 0) {
                console.log(
                    "Message was not on channel " + self.broadcastChannel + ". Ignoring.");
                return;
            }
            var msg = JSON.parse(event.data.substring(marker.length));

            return msg;
        };

        /*
         * Public API
         */
        var Socket = function (options) {
            if (!(this instanceof Socket)) {
                return new Socket(options);
            }

            var self = this,
                tolerance = typeof(options.lagTolerance) !== "undefined" ? options.lagTolerance : 0.1;

            this.broadcastChannel = options.broadcast;
            this.controlChannel = options.control;
            this._pubsub = PubSub();
            this._socket = makeSocket(
                options.endpoint, this.broadcastChannel, tolerance);

            this._socket.onmessage = function (event) {
                var msg = parse(self, event);
                if (msg) {
                    self._pubsub.publish(msg, msg.type);
                }
            };
        };

        Socket.prototype.open = function () {
            var isOpen = $.Deferred();

            this._socket.onopen = function (event) {
                isOpen.resolve();
            };

            return isOpen;
        };

        Socket.prototype.subscribe = function (handler, type, context) {
            this._pubsub.subscribe(handler, type, context);
        };

        Socket.prototype.send = function (data) {
            var msg = JSON.stringify(data),
                channel = this.controlChannel;

            console.log("Sending message to the " + channel + " channel: " + msg);
            this._socket.send(channel + ":" + msg);
        };

        Socket.prototype.broadcast = function (data) {
            var msg = JSON.stringify(data),
                channel = this.broadcastChannel;

            console.log("Broadcasting message to the " + channel + " channel: " + msg);
            this._socket.send(channel + ":" + msg);
        };

        return Socket;
    }());


    return backend;


}($, ReconnectingWebSocket));
