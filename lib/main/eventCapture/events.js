'use strict'

var EventEmitter = require('events');

var ErrsoleEvents = new EventEmitter();

ErrsoleEvents.UNCAUGHT_EXCEPTION = 'errsole.uncaught_exception';
ErrsoleEvents.ADD_HTTP_REQUEST_LOG = 'errsole.add_http_request_log';
ErrsoleEvents.REMOVE_HTTP_REQUEST_LOG = 'errsole.remove_http_request_log';
ErrsoleEvents.HTTP_RESPONSE_SENT = 'errsole.http_response_sent';
ErrsoleEvents.ROUTER_CONNECTION_ESTABLISHED = 'errsole.router_connection_established';

module.exports = ErrsoleEvents;
