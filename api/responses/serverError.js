/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, view);
 * return res.serverError(err, redirectTo);
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
 */

module.exports = function serverError(err, viewOrRedirect) {

    // Get access to `req` & `res`
    var req = this.req;
    var res = this.res;

    // Serve JSON (with optional JSONP support)
    function sendJSON(data) {
        if (!data) {
            return res.send();
        } else {
            if (typeof data !== 'object' || data instanceof Error) {
                data = {
                    error: data
                };
            }

            if (req.options.jsonp && !req.isSocket) {
                return res.jsonp(data);
            } else return res.json(data);
        }
    }

    // Set status code
    res.status(500);

    // Log error to console
    this.req._sails.log.error('Sent 500 ("Server Error") response');
    if (err) {
        this.req._sails.log.error(err);
    }

    // Only include errors in response if application environment
    // is not set to 'production'.  In production, we shouldn't
    // send back any identifying information about errors.
    if (this.req._sails.config.environment === 'production') {
        err = undefined;
    }

    // If the user-agent wants JSON, always respond with JSON
    if (req.wantsJSON) {
        return sendJSON(err);
    }

    // Make data more readable for view locals
    var locals;
    if (!err) {
        locals = {};
    } else if (typeof err !== 'object') {
        locals = {
            error: err
        };
    } else {
        var readabilify = function(value) {
            if (sails.util.isArray(value)) {
                return sails.util.map(value, readabilify);
            } else if (sails.util.isPlainObject(value)) {
                return sails.util.inspect(value);
            } else return value;
        };
        locals = {
            error: readabilify(err)
        };
    }

    // Serve HTML view or redirect to specified URL
    if (typeof viewOrRedirect === 'string') {
        if (viewOrRedirect.match(/^(\/|http:\/\/|https:\/\/)/)) {
            return res.redirect(viewOrRedirect);
        } else return res.view(viewOrRedirect, locals, function viewReady(viewErr, html) {
            if (viewErr) return sendJSON(err);
            else return res.send(html);
        });
    } else return res.view('500', locals, function viewReady(viewErr, html) {
        if (viewErr) return sendJSON(err);
        else return res.send(html);
    });

};