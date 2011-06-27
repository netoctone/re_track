Ext.ns('ReTrack.util');

ReTrack.util = {
  pluralize: function(name) {
    return name + 's';
  },

  isEmpty: function(obj) {
    for(var i in obj) {
      return false;
    }
    return true;
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
    var comboAddMap = {};
    for(var j = 0; j < opts.length; j++) {
      comboData.push([opts[j].display, opts[j].value]);
      comboMap[opts[j].value] = opts[j].display;
      if(opts[j].add) {
        comboAddMap[opts[j].value] = opts[j].add;
      }
    }
    return {
      renderer: function(val) {
        return comboMap[val];
      },
      valueToAddMap: comboAddMap,
      combo: {
        editable: false,
        mode: 'local',
        store: {
          xtype: 'arraystore',
          fields: ['display', 'value'],
          data: comboData
        },
        emptyText: 'no ' + name,
        valueField: 'value',
        displayField: 'display',
        triggerAction: 'all'
      }
    };
  }, // eo function buildCombo

  buildColsAndFieldsConfig: function(config) {
    var cols = [];
    var fields = [];
    for(var name in config) {
      var colConf = config[name];
      var col = {};
      if(colConf.header_name) {
        col.header = colConf.header_name;
      } else {
        col.header = name;
      }
      col.dataIndex = name;
      if(!(colConf.editable === false)) {
        if(colConf.type == 'string' || colConf.type == 'text') {
          col.editor = { xtype: 'textfield' };
        } else if(colConf.type == 'combo') {
          combo_and_rend = ReTrack.util.buildComboConfig(name,
                                                             colConf.options);
          col.editor = Ext.apply(combo_and_rend.combo, { xtype: 'combo' });
          col.renderer = combo_and_rend.renderer;
        }
      }

      cols.push(col);
      fields.push(name);
    }
    return {
      cols: cols,
      fields: fields
    };
  } // eo function buildGridColModelConfig
}

//ReTrack.util.recordToFormValues = function(name, obj) {
//  var res = {};
//  for(i in obj) {
//    res[name + '[' + i + ']'] = obj[i]
//  }
//  return res;
//}
