Ext.ns('ReTrack');

ReTrack.FormFieldEnable = Ext.extend(Ext.util.Observable, {
  constructor: function(config) {
    this.form = config.form;
    ReTrack.FormFieldEnable.superclass.constructor.call(this, config);

    this.fieldValToAdd = {};
    this.currentAdd = {};
    this.currentVal = {};
  },

  // fieldId is an itemId of form field
  // valueToAdd must be like { value: [fieldId, ...], ... }
  addFieldValToAdd: function(fieldId, valueToAdd) {
    this.fieldValToAdd[fieldId] = valueToAdd;
  },

  updateForm: function(values) {
    for(var fieldId in this.fieldValToAdd) {
      var val = values[this.form.func.subject + '[' + fieldId + ']'];
      if(val) {
        if(!(this.currentVal[fieldId] === val)) {
          this.updateField(fieldId, val, false);
        }
      }
    }
    this.form.doLayout();
  },

  updateField: function(fieldId, value) {
    this.currentVal[fieldId] = value;

    this.disableChildren(fieldId);
    this.enableChildren(fieldId, value);

    if(!(arguments[2] === false)) {
      this.form.doLayout();
    }
  },

  // private methods

  disableField: function(fieldId) {
    var field = this.form.getComponent(fieldId);
    field.disable();
    field.setVisible(false);
    this.disableChildren(fieldId);
  },

  disableChildren: function(fieldId) {
    var added = this.currentAdd[fieldId];
    if(added) {
      for(var i = 0; i != added.length; i++) {
        this.disableField(added[i]);
      }
      delete this.currentAdd[fieldId];
    }
  },

  enableField: function(fieldId) {
    var field = this.form.getComponent(fieldId);
    field.enable();
    field.setVisible(true);
    this.enableChildren(fieldId, field.getValue());
  },

  enableChildren: function(fieldId, value) {
    var valueToAdd = this.fieldValToAdd[fieldId];
    if(valueToAdd) {
      var toAdd = valueToAdd[value];
      if(toAdd) {
        for(var i = 0; i != toAdd.length; i++) {
          this.enableField(toAdd[i]);
        }
        this.currentAdd[fieldId] = toAdd;
      }
    }
  }
});

ReTrack.FunctionalForm = Ext.extend(Ext.form.FormPanel, {
  initComponent: function() {
    var func = this.func = this.initialConfig.functional;
    func.controller = ReTrack.util.pluralize(func.subject);
    var enabler = this.enabler = new ReTrack.FormFieldEnable({ form: this });

    var itemsConf = func.dataConfig;

    var comp = this;
    var items = [];
    var disabledItems = {};
    for(var name in itemsConf) {
      var itemConf = itemsConf[name];
      var item = {};
      item.itemId = name;
      if(itemConf.label) {
        item.fieldLabel = itemConf.label;
      } else {
        item.fieldLabel = name;
      }
      item.name = func.subject + '[' + name + ']';
      if(itemConf.disabled === true) {
        item.disabled = true;
      }
      if(itemConf.read_only === true) {
        item.readOnly = true;
      }
      if(!(itemConf.required === false)) {
        item.allowBlank = false;
        item.blankText = name + ' is required';
      }
      if(itemConf.type == 'string') {
        if(itemConf.shared === true) {
          Ext.apply(item, ReTrack.util.buildSharedComboConf(name,
                                                            itemConf.options));
        } else {
          item.xtype = 'textfield';
          if(name == 'password') {
            item.inputType = 'password';
          }
        }
      } else if(itemConf.type == 'text') {
        item.xtype = 'textarea';
      } else if(itemConf.type == 'date') {
        item.xtype = 'datefield';
      } else if(itemConf.type == 'combo') {
        item.hiddenName = item.name;
        delete item.name;
        var combo_and_help = ReTrack.util.buildComboConfig(name,
                                                           itemConf.options);
        Ext.apply(item, combo_and_help.combo);
        item = new Ext.form.ComboBox(item);
        var valueToAdd = combo_and_help.valueToAddMap;
        if(!ReTrack.util.isEmpty(valueToAdd)) {
          enabler.addFieldValToAdd(item.itemId, valueToAdd);
          item.on('select', function(combo) {
            enabler.updateField(combo.itemId, combo.getValue());
          });

          for(var val in valueToAdd) {
            var add = valueToAdd[val];
            for(var i = 0; i != add.length; i++) {
              disabledItems[add[i]] = true;
            }
          }
        }
      } // eo 'combo' case

      Ext.applyIf(item, itemConf.form_style);
      Ext.applyIf(item, itemConf.style);
      if(itemConf.type == 'text') {
        item.width = item.width || 200;
      }

      items.push(item);
    }

    var config = {
      items: items
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.FunctionalForm.superclass.initComponent.apply(this, arguments);

    for(var itemId in disabledItems) { // can't set ComboBox by config properly
      var field = this.getComponent(itemId);
      field.disable();
      field.setVisible(false);
    }
  }, // eo function initComponent

  constructor: function(config) {
    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      show: function(comp) {
      }
    });

    ReTrack.FunctionalForm.superclass.constructor.call(this, config);
  },

  submitUpdate: function(conf) {
    var comp = this;
    var callback = ReTrack.util.buildCallback(conf);

    var waitMsg = 'Updating ...';
    if(conf.waitMsg) {
      waitMsg = conf.waitMsg;
    }

    comp.getForm().submit({
      waitMsg: waitMsg,
      url: comp.func.controller + '/update.json',
      method: 'put',
      success: function(form, action) {
        var values = action.result[comp.func.subject];
        comp.updateSubject(values);
        callback.success();
      },
      failure: function(form, action) {
        comp.rollbackSubject();

        var errormsg = '';
        var failureType = action.failureType;
        if(failureType == Ext.form.Action.CLIENT_INVALID) {
          errormsg = 'Data isn\'t valid';
        } else if(failureType == Ext.form.Action.CONNECT_FAILURE) {
          errormsg = 'Server not responding';
        } else if(failureType == Ext.form.Action.SERVER_INVALID) {
          errormsg = action.result.errormsg;
        }
        callback.failure(errormsg);
      }
    });
  }, // eo function submitUpdate

  submitCreate: function(conf) {
    var comp = this;
    var callback = ReTrack.util.buildCallback(conf);

    var waitMsg = 'Creating ...';
    if(conf.waitMsg) {
      waitMsg = conf.waitMsg;
    }

    this.getForm().submit({
      waitMsg: waitMsg,
      url: this.func.controller + '/create.json',
      method: 'post',
      success: function(form, action) {
        form.reset();
        comp.enabler.updateForm(form.getValues());
        callback.success(action.result.id);
      },
      failure: function(form, action) {
        var errormsg = '';
        var failureType = action.failureType;
        if(failureType == Ext.form.Action.CLIENT_INVALID) {
          errormsg = 'Data isn\'t valid';
        } else if(failureType == Ext.form.Action.CONNECT_FAILURE) {
          errormsg = 'Server not responding';
        } else if(failureType == Ext.form.Action.SERVER_INVALID) {
          errormsg = action.result.errormsg;
        }
        callback.failure(errormsg);
      }
    });
  }, // eo function submitCreate

  requestDelete: function(conf) {
    var comp = this;
    var callback = ReTrack.util.buildCallback(conf);

    Ext.Ajax.request({
      url: comp.func.controller + '/destroy.json',
      method: 'delete',
      params: {
        id: comp.getForm().getValues().id
      },
      success: function(resp) {
        var respObj = Ext.decode(resp.responseText);
        if(respObj.success) {
          //unset validation highlight
          callback.success();
        } else {
          callback.failure('Server failed to delete ' + comp.func.subject);
        }
      },
      failure: function() {
        callback.failure('Server not responding');
      }
    });
  }, // eo function requestDelete

  updateSubject: function(values) {
    this.oldValues = values;
    this.getForm().setValues(values);

    this.enabler.updateForm(values);
  },

  getSubject: function() {
    var values = {};
    this.items.each(function(f) {
      values[f.getItemId()] = f.getValue();
    });
    return values;
  },

  //private method
  rollbackSubject: function() {
    //maybe load data from server
    this.getForm().setValues(this.oldValues);

    this.enabler.updateForm(this.oldValues);
  }
});
