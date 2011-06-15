Ext.ns('ReTrack.functional');

Ext.apply(ReTrack.functional, {
  loadFunctionalEdit: function(config) {
    var conf = {
      subject: config.functional.subject,
      controller: ReTrack.util.pluralize(config.functional.subject),
      comboConf: config.functional.combo,
      formConf: config.functional.form,
      cardConf: config.functional.formCard
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

  //deprecated, use ReTrack.FunctionalForm instead
  buildFormItemsConfig: function(conf, formConfig) {
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
        var combo_and_help = ReTrack.util.buildComboConfig(name,
                                                           itemConf.options);
        Ext.apply(item, combo_and_help.combo);
      }
      items.push(item);
    }
    return items;
  }, // eo function buildFormItems

  buildContent: function(conf, formConfig) {
    var funcCombo = undefined;
    var createForm = new ReTrack.FunctionalForm(Ext.applyIf({
      functional: {
        subject: conf.subject,
        dataConfig: formConfig
      },
      border: false,
      autoHeight: true,
      buttons: [
        {
          text: 'Create',
          type: 'submit',
          handler: function() {
            createForm.submitCreate({
              success: function(id) {
                funcCombo.selectNewById(id);
                //notification?
              },
              failure: function(errormsg) {
                Ext.Msg.alert('Error', errormsg);
              }
            });
          }
        }
      ]
    }, conf.formConf)); // eo createForm creation

    var formCard = undefined;
    var updateForm = new ReTrack.FunctionalForm(Ext.applyIf({
      functional: {
        subject: conf.subject,
        dataConfig: formConfig
      },
      border: false,
      autoHeight: true,
      buttons: [
        {
          text: 'Delete',
          type: 'submit',
          handler: function() {
            updateForm.requestDelete({
              success: function() {
                funcCombo.setValue('');
                formCard.getLayout().setActiveItem(0);
                if(conf.deselectCallback) {
                  conf.deselectCallback();
                }
                funcCombo.selectCurrent();
                Ext.Msg.alert('Notification', conf.subject + ' deleted');
              },
              failure: function(errormsg) {
                Ext.Msg.alert('Error', errormsg);
              }
            });
          }
        }, // eo 'Delete' button config
        {
          text: 'Update',
          type: 'submit',
          handler: function() {
            updateForm.submitUpdate({
              success: function() {
                funcCombo.updateCurrentName();
                //Ext.Msg.alert('Notification', comp.func.subject + ' updated');
              },
              failure: function(errormsg) {
                Ext.Msg.alert('Error', errormsg);
              }
            });
          }
        } // eo 'Update' button config
      ]
    }, conf.formConf));// eo updateForm create
    updateForm.add({
      xtype: 'hidden',
      name: 'id'
    });

    funcCombo = ReTrack.functional.buildCombo({
      subject: conf.subject,
      config: conf.comboConf,
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

    formCard = new Ext.Panel(Ext.applyIf({
      layout: 'card',
      activeItem: 0,
      items: [
        createForm,
        updateForm
      ]
    }, conf.cardConf));

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

  buildCombo: function(conf) {
    return new ReTrack.FunctionalCombo(Ext.apply({
      functional: {
        subject: conf.subject,
        subjectSelectCallback: {
          success: function(subject) {
            conf.success(subject);
          },
          failure: function(errormsg) {
            conf.failure(errormsg);
          }
        }
      }
    }, conf.config));
  } // eo function buildCombo
});
