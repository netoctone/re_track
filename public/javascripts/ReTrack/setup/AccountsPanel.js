Ext.ns('ReTrack');

ReTrack.AccountsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var accCombo = undefined;
    var accFormsCard = undefined;
    var updateAccForm = undefined;
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
                Ext.apply(values, { id: action.result.id });
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
                  Ext.Msg.alert('Account wan\'t created', action.result.errormsg);
                }
              }
            });
          }
        }
      ]
    });
    updateAccForm = this.updateAccForm = new ReTrack.AccountForm({
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
              success: function(resp) {
                var respObj = Ext.util.JSON.decode(resp.responseText);
                if(respObj.success) {
                  //unset validation highlight
                  accCombo.setValue('');
                  accCombo.getStore().reload();
                  accFormsCard.getLayout().setActiveItem(0);
                  Ext.Msg.alert('Notification', 'account successfully deleted');
                } else {
                  Ext.Msg.alert('Error', 'can\'t delete account');
                }
              },
              failure: function() {
                //think
                Ext.Msg.alert('Connection failure', 'server not responding');
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
                var values = action.result.account;
                accCombo.getStore().reload({
                  callback: function() {
                    accCombo.setValue(values.id);
                  }
                });
                updateAccForm.updateAccount(values);
                //Ext.Msg.alert('Notification', 'account successfully updated');
              },
              failure: function(form, action) {
                if(action.failureType == Ext.form.Action.CLIENT_INVALID) {
                  Ext.Msg.alert('Data wasn\'t submitted', 'validation error');
                } else if(action.failureType == Ext.form.Action.CONNECT_FAILURE) {
                  Ext.Msg.alert('Connection failure', 'server not responding');
                } else if(action.failureType == Ext.form.Action.SERVER_INVALID) {
                  Ext.Msg.alert('Account wan\'t updated', action.result.errormsg);//is it true?
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
      updateAccount: function(values) {
        updateAccForm.oldValues = values;
        updateAccForm.getForm().setValues(values);
      },
      setAccount: function(values) {
        if(updateAccForm.getForm().getValues().id != values.id) {
          Ext.Ajax.request({
            url: 'bts_accounts/update_current.json',
            method: 'put',
            params: {
              id: values.id
            }
          }); //no need to display if the request successful?
        }
        updateAccForm.updateAccount(values);
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
        updateAccForm.getForm().setValues(updateAccForm.oldValues);//maybe load data from server
      }
    });
    
    accCombo = this.accCombo = new ReTrack.AccountsCombo({
      listeners: {
        accountSelect: function(account) {
          accFormsCard.getLayout().setActiveItem(1);
          updateAccForm.updateAccount(account);
        }
      }
    });

    accFormsCard = this.accFormsCard = new Ext.Panel({
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
        comp.accCombo.selectCurrent();
      }
    });

    ReTrack.AccountsPanel.superclass.constructor.call(this, config);
  } // eo function constructor
});
