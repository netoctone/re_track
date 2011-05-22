Ext.ns('ReTrack');

ReTrack.AccountsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var accCombo = null;
    var accFormsCard = null;
    var updateAccForm = null;
    var createAccForm = new ReTrack.AccountForm({
      title: 'New account',
      url: 'bts_accounts/create.json',
      buttons: [
        {
          text: 'Create',
          type: 'submit',
          handler: function() {
            createAccForm.getForm().submit({
              waitMsg: 'Creating...',
              success: function(form, action) {
                var values = form.getValues();
                form.reset();
                var respObj = Ext.util.JSON.decode(action.response.responseText);
                Ext.apply(values, { id: respObj.id });
                accCombo.getStore().reload({
                  callback: function() {
                    accCombo.setValue(values.id);
                  }
                });
                accFormsCard.getLayout().setActiveItem(1);
                updateAccForm.setAccount(values);
                //notification?
              },
              failure: function(form, action) {
                if(action.failureType == Ext.form.Action.CLIENT_INVALID) {
                  Ext.Msg.alert('Data wasn\'t submitted', 'validation error');
                } else if(action.failureType == Ext.form.Action.SERVER_INVALID) {
                  Ext.Msg.alert('Account wan\'t created', 'wrong login details');
                }
              }
            });
          }
        }
      ]
    });
    updateAccForm = new ReTrack.AccountForm({
      title: 'Account',
      buttons: [
        {
          text: 'Delete',
          type: 'submit',
          handler: function() {
            Ext.Ajax.request({
              url: 'bts_accounts/destroy.json',
              method: 'delete',
              params: {
                id: updateAccForm.getForm().getValues().id
              },
              success: function() {
                //unset validation highlight
                accCombo.setValue('');
                accCombo.getStore().reload();
                accFormsCard.getLayout().setActiveItem(0);
                Ext.Msg.alert('Notification', 'account successfully deleted');
              },
              failure: function() {
                Ext.Msg.alert('failure', 'some error occured');
              }
            });
          }
        },
        {
          text: 'Update',
          type: 'submit',
          handler: function() {
            updateAccForm.getForm().submit({
              url: 'bts_accounts/update.json',
              method: 'put',
              waitMsg: 'Updating ...',
              success: function(form, action) {
                var respObj = Ext.util.JSON.decode(action.response.responseText);
                var values = respObj.account;
                accCombo.getStore().reload({
                  callback: function() {
                    accCombo.setValue(values.id);
                  }
                });
                updateAccForm.setAccount(values);
                //Ext.Msg.alert('Notification', 'account successfully updated');
              },
              failure: function(form, action) {
                if(action.failureType == Ext.form.Action.CLIENT_INVALID) {
                  Ext.Msg.alert('Data wasn\'t submitted', 'validation error');
                } else if(action.failureType == Ext.form.Action.CONNECT_FAILURE) {
                  Ext.Msg.alert('Connection failure', 'server not responding');
                } else if(action.failureType == Ext.form.Action.SERVER_INVALID) {
                  Ext.Msg.alert('Account wan\'t updated', 'wrong login details');
                }
                updateAccForm.rollbackAccount();
              }
            });
          }
        }
      ]
    });
    updateAccForm.add({
      xtype: 'hidden',
      name: 'id'
    });
    Ext.apply(updateAccForm, {
      setAccount: function(values) {
        updateAccForm.oldValues = values;
        updateAccForm.getForm().setValues(values);
      },
      loadAccount: function(id) {
        Ext.Ajax.request({
          url: 'bts_accounts/show.json' +
               Ext.urlEncode({ id: id }, '?'),
          method: 'get', 
          success: function(resp) {
            var respObj = Ext.util.JSON.decode(resp.responseText);
            updateAccForm.setAccount(respObj.account);
          },
          failure: function(resp) {
            Ext.Msg.alert('Error', 'unexpected error');//meaningful note?
          }
        });
      },
      rollbackAccount: function() {
        updateAccForm.getForm().setValues(updateAccForm.oldValues);
        // OR
        //var id = updateAccForm.getForm().getFieldValues().id;
        //Ext.Ajax.request({
        //  url: 'bts_accounts/show.json' +
        //       Ext.urlEncode({ id: id }, '?'),
        //  method: 'get', 
        //  success: function(resp) {
        //    var respObj = Ext.util.JSON.decode(resp.responseText); 
        //    updateAccForm.getForm().setValues(respObj.account);
        //  },
        //  failure: function(resp) {
        //    Ext.Msg.alert('Error', 'unexpected error');//??
        //  }
        //});
      }
    });
    
    this.accCombo = new Ext.form.ComboBox({
      editable: false,
      mode: 'local',
      store: new Ext.data.JsonStore({
        url: 'bts_accounts/list.json',
        root: 'accounts',
        fields: ['id', 'name']
      }),
      emptyText: 'no account',
      valueField: 'id',
      displayField: 'name',
      triggerAction: 'all',
      listeners: {
        select: function(combo, record) {
          accFormsCard.getLayout().setActiveItem(1);//where are the guerantees?
          updateAccForm.loadAccount(record.id);
        }
      }
    });
    var accCombo = this.accCombo;

    accFormsCard = new Ext.Panel({
      layout: 'card',
      width: 350,
      height: 170,
      activeItem: 0,
      items: [
        createAccForm,
        updateAccForm
      ]
    });

    var config = {
      title: 'Accounts',
      items: [
        {
          xtype: 'toolbar',
          items: [
            accCombo,
            {
              text: 'New',
              handler: function() {
                //unset current validation highlight
                accFormsCard.getLayout().setActiveItem(0);
                accCombo.setValue('');
              }
            }
          ]
        },
        accFormsCard
      ]
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.AccountsPanel.superclass.initComponent.apply(this, arguments);
  }, //eo function initComponent
  
  constructor: function(config) {
    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      show: function(comp) {
        comp.accCombo.getStore().reload();
      }
    });

    ReTrack.AccountsPanel.superclass.constructor.call(this, config);
  } // eo function constructor
});
