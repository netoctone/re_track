Ext.ns('ReTrack.util');

ReTrack.util = {
  pluralize: function(name) {
    return name + 's';
  },

  buildCallback: function(funConfig, defConfig) {
    var result = {
      success: function() {},
      failure: function() {}
    };

    if(funConfig && funConfig.success) {
      result.success = funConfig.success;
    } else if(defConfig && defConfig.success) {
      result.success = defConfig.success;
    }

    if(funConfig && funConfig.failure) {
      result.failure = funConfig.failure;
    } else if(defConfig && defConfig.failure) {
      result.failure = defConfig.failure;
    }

    return result;
  }, // eo function buildCallback

  buildComboConfig: function(name, opts) {
    var comboData = [];
    var comboMap = {};
    for(var j = 0; j < opts.length; j++) {
      comboData.push([opts[j].display, opts[j].value]);
      comboMap[opts[j].value] = opts[j].display;
    }
    return {
      renderer: function(val) {
        return comboMap[val];
      },
      combo: {
        editable: false,
        mode: 'local',
        store: new Ext.data.ArrayStore({
          fields: ['display', 'value'],
          data: comboData
        }),
        emptyText: 'no ' + name,
        valueField: 'value',
        displayField: 'display',
        triggerAction: 'all'
      }
    };
  } // eo function buildCombo
}

//ReTrack.util.recordToFormValues = function(name, obj) {
//  var res = {};
//  for(i in obj) {
//    res[name + '[' + i + ']'] = obj[i]
//  }
//  return res;
//}
