function guid() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}
module.exports = function (name) {
    return function (method, model, options) {

        var store = localStorage.getItem(name),
            records = (store && store.split(',')) || [];

        var result;
        options = typeof(options) === "undefined" ? {} : options;
        if (options.data === null || options && model && (method === 'create' || method === 'update' || method === 'patch')) {
            model = options.attrs || model.toJSON(options);
        }
        try {
            switch(method) {
                case 'create':
                    if (!model.getId()) model[model.idAttribute || 'id'] = guid();
                    records.push(model.getId().toString());
                case 'update':
                    if(records.indexOf(model.getId().toString()) === -1) records.push(model.getId().toString());
                    localStorage.setItem(name + '-' + model.getId(), JSON.stringify(model));
                    break;
                case 'patch':
                    result = localStorage.getItem(name + '-' + model.getId());
                    result = result === null ? {} : JSON.parse(result);
                    for (var attrname in model) { result[attrname] = model[attrname]; }
                    localStorage.setItem(name + '-' + model.getId(), JSON.stringify(model));
                    break;
                case 'delete':
                    records.splice(records.indexOf(model.getId().toString()), 1);
                    localStorage.removeItem(name + '-' + model.getId());
                    break;
                case 'read':
                    if(!model.getId()) {
                        result = records
                            .map(function (id) { return JSON.parse(localStorage.getItem(name + '-' + id)); })
                            .filter(function (r) { return r !== null; });
                    } else {
                        result = JSON.parse(localStorage.getItem(name + '-' + model.getId()));
                    }
                    break;
            }
            if (records.length === 0){
                localStorage.removeItem(name);
            }else{
                localStorage.setItem(name, records.join(','));
            }
        } catch (ex) {
            if (options && options.error) options.error(result, 'error', ex.message);
            else throw ex;
        }
        if (options && options.success) options.success(result, 'success');
    };
};