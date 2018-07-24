from flask import request, abort, send_from_directory, safe_join, jsonify

from rulematrix.server import app, get_model, available_models, HashableList
from rulematrix.server.jsonify import model2json, model_data2json, get_model_x_y
from rulematrix.server.helpers import model_metric, get_support, get_stream


def parse_filter(query_json):
    if query_json is None:
        return query_json
    return HashableList(query_json)


@app.route('/static/js/<path:path>')
def send_js(path):
    return send_from_directory(safe_join(app.config['STATIC_FOLDER'], 'js'), path)


@app.route('/static/css/<path:path>')
def send_css(path):
    return send_from_directory(safe_join(app.config['STATIC_FOLDER'], 'css'), path)


@app.route('/static/fonts/<path:path>')
def send_fonts(path):
    return send_from_directory(safe_join(app.config['STATIC_FOLDER'], 'fonts'), path)


@app.route('/')
def index():
    return send_from_directory(app.config['FRONT_END_ROOT'], 'index.html')


@app.route('/<string:model>', methods=['GET'])
def send_index(model):
    if model == 'service-worker.js':
        return send_from_directory(app.config['FRONT_END_ROOT'], 'service-worker.js')
    if model == 'favicon.ico':
        return send_from_directory(app.config['FRONT_END_ROOT'], 'favicon.ico')
    return send_from_directory(app.config['FRONT_END_ROOT'], 'index.html')


@app.route('/api/model', methods=['GET'])
def models():
    # model_name = request.args.get('name')
    # if model_name is None:
    return jsonify(available_models())
    # else:
    #     model_json = model2json(model_name)
    #     if model_json is None:
    #         abort(404)
    #     else:
    #         return model_json


@app.route('/api/model/<string:model_name>', methods=['GET'])
def model_info(model_name):
    # model_name = request.args.get('name')
    # if model_name is None:
    #     return jsonify(available_models())
    # else:
    model_json = model2json(model_name)
    if model_json is None:
        return abort(404)
    return model_json


@app.route('/api/model_data/<string:model_name>', methods=['GET', 'POST'])
def model_data(model_name):
    if model_name is None:
        return abort(404)
    data_type = request.args.get('data', 'train')
    bins = int(request.args.get('bins', '20'))
    if request.method == 'GET':
        data_json = model_data2json(model_name, data_type, bins)
    else:
        filters = parse_filter(request.get_json())
        data_json = model_data2json(model_name, data_type, bins, filters=filters)
    if data_json is None:
        abort(404)
    else:
        return data_json


@app.route('/api/metric/<string:model_name>', methods=['GET'])
def metric(model_name):
    data = request.args.get('data', 'test')

    ret_json = model_metric(model_name, data)
    if ret_json is None:
        abort(404)
    else:
        return ret_json


@app.route('/api/support/<string:model_name>', methods=['GET', 'POST'])
def support(model_name):
    data_type = request.args.get('data', 'train')
    support_type = request.args.get('support', 'simple')
    if request.method == 'GET':
        ret_json = get_support(model_name, data_type, support_type)
    else:
        filters = parse_filter(request.get_json())
        ret_json = get_support(model_name, data_type, support_type, filters=filters)
    # ret_json = get_support(model_name, data_type, support_type)
    if ret_json is None:
        abort(404)
    else:
        return ret_json


@app.route('/api/stream/<string:model_name>', methods=['GET', 'POST'])
def stream(model_name):
    data_type = request.args.get('data', 'train')
    # per_class = request.args.get('class', 'true') == 'true'
    conditional = request.args.get('conditional', 'true') == 'true'
    bins = int(request.args.get('bins', '20'))
    if request.method == 'GET':
        ret_json = get_stream(model_name, data_type, conditional=conditional, bins=bins)
    else:
        filters = parse_filter(request.get_json())
        ret_json = get_stream(model_name, data_type, conditional=conditional, bins=bins, filters=filters)
    if ret_json is None:
        abort(404)
    else:
        return ret_json


@app.route('/api/query/<string:model_name>', methods=['POST'])
def query(model_name):
    if model_name is None:
        abort(404)
    data_type = request.args.get('data', 'train')
    start = int(request.args.get('start', '0'))
    end = int(request.args.get('end', '100'))
    query_json = request.get_json()
    print(query_json)
    filters = None if query_json is None else HashableList(query_json)
    try:
        data = get_model_x_y(model_name, data_type, filters)
    except:
        raise

    if data is None:
        abort(404)
    else:
        x, y = data
        print("get", len(y))
        return jsonify({
            'data': x[start:end],
            'target': y[start:end],
            'end': end,
            'totalLength': len(y)
        })
# @app.route('/api/models/<string:model_name>', methods=['GET'])
# def model_info(model_name):
#     model = get_model(model_name)
#     return jsonify(model2json(model))


@app.route('/api/predict', methods=['POST'])
def predict():
    name = request.args.get('name')
    data = request.args.get('data')
    if name is None:
        abort(404)
    else:
        return get_model(name).predict(data)
