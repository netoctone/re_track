Ext.ns('ReTrack');

ReTrack.FunctionalForm = Ext.extend(Ext.form.FormPanel, {
  initComponent: function() {
    var func = this.func = this.initialConfig.functional;
    func.controller = ReTrack.util.pluralize(func.subject);
    var addComboList = this.addComboList = [];

    var itemsConf = func.dataConfig;

    var comp = this;
    var items = [];
    for(var name in itemsConf) {
      var itemConf = itemsConf[name];
      var item = {};
      if(itemConf.label) {
        item.fieldLabel = itemConf.label;
      } else {
        item.fieldLabel = name;
      }
      item.name = func.subject + '[' + name + ']';
      if(!(itemConf.required === false)) {
        item.allowBlank = false;
        item.blankText = name + ' is required';
      }
      if(itemConf.type == 'string') {
        item.xtype = 'textfield';
        if(name == 'password') {
          item.inputType = 'password';
        }
      } else if(itemConf.type == 'combo') {
        var combo_and_help = ReTrack.util.buildComboConfig(name,
                                                           itemConf.options);
        Ext.apply(item, combo_and_help.combo);
        item = new Ext.form.ComboBox(item);
        if(!ReTrack.util.isEmpty(combo_and_help.valueToAddConfMap)) {
          var valueToAddConfMap = combo_and_help.valueToAddConfMap;
          var valueToAdd = {};
          for(var value in valueToAddConfMap) {
            var addConf = valueToAddConfMap[value];
            var add = {};

            //maybe some kind of recursion
            for(var name in addConf) {
              var itConf = addConf[name];
              var it = {
                itemId: name
              };
              if(itConf.label) {
                it.fieldLabel = itConf.label;
              } else {
                it.fieldLabel = name;
              }
              it.name = func.subject + '[' + name + ']';
              it.allowBlank = false;
              it.blankText = name + ' is required';
              if(itConf.type == 'string') {
                it.xtype = 'textfield';
              }

              add[name] = it;
            }

            valueToAdd[value] = add;
          } // eo valueToAdd creation

          //no cross-addition taken into account
          item.updateAddition = function() {
            var addedItemIds = [];
            return function() {
              var addedItemId = undefined;
              while(addedItemId = addedItemIds.pop()) {
                comp.getComponent(addedItemId).destroy();
              }

              var addItems = undefined;
              if(addItems = valueToAdd[this.getValue()]) {
                for(var name in addItems) {
                  comp.add(addItems[name]);
                  addedItemIds.push(name);
                }
                comp.doLayout(); //maybe use outside this block
              }
            };
          }();

          item.on('select', function(combo) {
            combo.updateAddition();
          });

          addComboList.push(item);
        }
      } // eo 'combo' case
      items.push(item);
    }
    var config = {
      items: items
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.FunctionalForm.superclass.initComponent.apply(this, arguments);
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

    this.getForm().submit({
      waitMsg: waitMsg,
      url: this.func.controller + '/update.json',
      method: 'put',
      success: function(form, action) {
        var values = action.result.subject;
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

    var addComboList = this.addComboList;
    for(var i = 0; i != addComboList.length; i++) {
      addComboList[i].updateAddition();
    }
    this.getForm().setValues(values); //think
  },

  //private method
  rollbackSubject: function() {
    //maybe load data from server
    this.getForm().setValues(this.oldValues);
  }
});
