Ext.ns('ReTrack.functional');

Ext.apply(ReTrack.functional, {
  loadFunctionalEdit: function(config) {
    var conf = {
      subject: config.functional.subject,
      controller: ReTrack.util.pluralize(config.functional.subject)
    };

    if(config && config.functional && config.functional.callback) {
      var callback = config.functional.callback;
      if(callback.load) {
        conf.loadCallback = callback.load;
      }
      if(callback.subjectSelect) {
        conf.selectCallback = callback.subjectSelect;
      }
      if(callback.subjectDeselect) {
        conf.deselectCallback = callback.subjectDeselect;
      }
    }

    ReTrack.functional.loadContent(conf);
  }, //eo function loadFunctionalEdit

  loadContent: function(conf) {
    Ext.Ajax.request({
      url: conf.controller + '/form_data_config.json',
      method: 'get',
      success: function(resp) {
        respObj = Ext.util.JSON.decode(resp.responseText);
        if(respObj.success) {
          cont = ReTrack.functional.buildContent(conf, respObj.config);
          if(conf.loadCallback && conf.loadCallback.success) {
            conf.loadCallback.success(cont.combo, cont.button, cont.card);
          }
        } else {
          if(conf.loadCallback && conf.loadCallback.failure) {
            conf.loadCallback.failure(respObj.errormsg);
          }
        }
      },
      failure: function() {//maybe use received data?
        if(conf.loadCallback && conf.loadCallback.failure) {
          conf.loadCallback.failure('Server not responding');
        }
      }
    });
  }, // eo function loadContent

  buildFormItems: function(conf, formConfig) {
    var items = [];
    for(var name in formConfig) {
      var itemConf = formConfig[name];
      var item = {};
      if(itemConf.label) {
        item.fieldLabel = itemConf.label;
      } else {
        item.fieldLabel = name;
      }
      item.name = conf.subject + '[' + name + ']';
      item.allowBlank = false;
      item.blankText = name + ' is required';
      if(itemConf.type == 'string') {
        item.xtype = 'textfield';
        if(name == 'password') {
          item.inputType = 'password';
        }
      } else if(itemConf.type == 'combo') {
        item.xtype = 'combo';
        Ext.apply(item,
                  ReTrack.util.buildComboConfig(name, itemConf.options).combo);
      }
      items.push(item);
    }
    return items;
  }, // eo function buildFormItems

  buildContent: function(conf, formConfig) {
    var funcCombo = undefined;
    var createFormItems = ReTrack.functional.buildFormItems(conf, formConfig);
    var createForm = new Ext.form.FormPanel({
      title: 'New ' + conf.subject,
      url: conf.controller + '/create.json',
      border: false,
      items: createFormItems,
      buttons: [
        {
          text: 'Create',
          type: 'submit',
          handler: function() {
            createForm.getForm().submit({
              waitMsg: 'Creating...',
              success: function(form, action) {
                var values = form.getValues();
                form.reset();
                Ext.apply(values, { id: action.result.id });
                funcCombo.selectNewById(values.id);
                //notification?
              },
              failure: function(form, action) {
                var failureType = action.failureType;
                if(failureType == Ext.form.Action.CLIENT_INVALID) {
                  Ext.Msg.alert('Error', 'Data isn\'t valid');
                } else if(failureType == Ext.form.Action.CONNECT_FAILURE) {
                  Ext.Msg.alert('Connection failure', 'Server not responding');
                } else if(failureType == Ext.form.Action.SERVER_INVALID) {
                  Ext.Msg.alert(conf.subject + ' hasn\'t created',
                                action.result.errormsg);
                }
              }
            });
          }
        }
      ]
    }); // eo createForm create

    var formCard = undefined;
    var updateFormItems = ReTrack.functional.buildFormItems(conf, formConfig);
    var updateForm = new Ext.form.FormPanel({
      title: conf.subject,
      border: false,
      items: updateFormItems,
      buttons: [
        {
          text: 'Delete',
          type: 'submit',
          handler: function() {
            Ext.Ajax.request({
              url: conf.controller + '/destroy.json',
              method: 'delete',
              params: {
                id: updateForm.getForm().getValues().id
              },
              success: function(resp) {
                var respObj = Ext.util.JSON.decode(resp.responseText);
                if(respObj.success) {
                  //unset validation highlight
                  funcCombo.setValue('');
                  formCard.getLayout().setActiveItem(0);
                  if(conf.deselectCallback) {
                    conf.deselectCallback();
                  }
                  funcCombo.selectCurrent();
                  Ext.Msg.alert('Notification', conf.subject + ' deleted');
                } else {
                  Ext.Msg.alert('Error', 'Can\'t delete ' + conf.subject);
                }
              },
              failure: function() {
                //think
                Ext.Msg.alert('Connection failure', 'Server not responding');
              }
            });
          }
        }, // eo 'Delete' button config
        {
          text: 'Update',
          type: 'submit',
          handler: function() {
            updateForm.getForm().submit({
              url: conf.controller + '/update.json',
              method: 'put',
              waitMsg: 'Updating ...',
              success: function(form, action) {
                var values = action.result.subject;
                funcCombo.updateCurrentName();
                updateForm.updateSubject(values);
                //Ext.Msg.alert('Notification', comp.func.subject + ' updated');
              },
              failure: function(form, action) {
                var failureType = action.failureType;
                if(failureType == Ext.form.Action.CLIENT_INVALID) {
                  Ext.Msg.alert('Error', 'Data isn\'t valid');
                } else if(failureType == Ext.form.Action.CONNECT_FAILURE) {
                  Ext.Msg.alert('Connection failure', 'Server not responding');
                } else if(failureType == Ext.form.Action.SERVER_INVALID) {
                  Ext.Msg.alert(conf.subject + ' hasn\'t updated',
                                action.result.errormsg);//is it true?
                }
                updateForm.rollbackSubject();
              }
            });
          }
        } // eo 'Update' button config
      ]
    });// eo updateForm create
    updateForm.add({
      xtype: 'hidden',
      name: 'id'
    });
    Ext.apply(updateForm, {
      updateSubject: function(values) {
        updateForm.oldValues = values;
        updateForm.getForm().setValues(values);
      },
      rollbackSubject: function() {
        //maybe load data from server
        updateForm.getForm().setValues(updateForm.oldValues);
      }
    });

    funcCombo = ReTrack.functional.buildCombo(conf.subject, {
      success: function(subject) {
        formCard.getLayout().setActiveItem(1);
        updateForm.updateSubject(subject);
        if(conf.selectCallback && conf.selectCallback.success) {
          conf.selectCallback.success(subject);
        }
      },
      failure: function(errormsg) {
        if(conf.selectCallback && conf.selectCallback.failure) {
          conf.selectCallback.failure(errormsg);
        }
      }
    });

    formCard = new Ext.Panel({
      layout: 'card',
      width: 350,
      height: 170,
      activeItem: 0,
      items: [
        createForm,
        updateForm
      ]
    });

    return {
      combo: funcCombo,
      button: new Ext.Button({
        text: 'New',
        handler: function() {
          //unset current validation highlight
          funcCombo.setValue('');
          formCard.getLayout().setActiveItem(0);
          if(conf.deselectCallback) {
            conf.deselectCallback();
          }
        }
      }),
      card: formCard
    };
  }, // eo function buildContent

  buildCombo: function(subject, callback) {
    return new ReTrack.FunctionalCombo({
      functional: {
        subject: subject,
        subjectSelectCallback: {
          success: function(subject) {
            callback.success(subject);
          },
          failure: function(errormsg) {
            callback.failure(errormsg);
          }
        }
      }
    });
  } // eo function buildCombo
});
