/* Wrapper on XMLHttpRequest */
module.exports = function() {
    var req = null;

    function _create_request(type, url, isAjax) {
        req = new XMLHttpRequest();
        req.open(type, url, isAjax);
        return this;
    };

    function _set_response_handler(cb) {
        req.onreadystatechange = function() {
            if(req.readyState == 4) {
                cb();
            }
        };

        return this;
    };

    function _send(data) {
        req.send(data);
        return this;
    };

    function _response_text() {
        return req.responseText;
    }

    return {
        create_request: _create_request,
        set_response_handler: _set_response_handler,
        send: _send,
        response_text: _response_text,
        toObject: function() {
            return req;
        }
    };
};
