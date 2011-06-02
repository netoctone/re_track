Ext.ns('ReTrack');

ReTrack.AccountsCombo = Ext.extend(Ext.form.ComboBox, {
  initComponent: function() {
    var config = {
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
      triggerAction: 'all'
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.AccountsCombo.superclass.initComponent.apply(this, arguments);
  }, //eo function initComponent

  constructor: function(config) {
    if(config != undefined &&
       config.listeners != undefined &&
       config.listeners.accountSelect != undefined) {
      this.accountSelect = config.listeners.accountSelect;
      Ext.applyIf(config.listeners, {
        select: function(combo, record) {
          Ext.Ajax.request({
            url: 'bts_accounts/show.json' +
                 Ext.urlEncode({ id: record.id }, '?'),
            method: 'get',
            success: function(resp) {
              var respObj = Ext.util.JSON.decode(resp.responseText);
              if(respObj.success) {
                config.listeners.accountSelect(respObj.account);
              } else {
                //meaningful note?
                Ext.Msg.alert('Error', 'can\'t load account');
              }
            },
            failure: function(resp) {
              //meaningful note?
              Ext.Msg.alert('Connection failure', 'server not responding');
            }
          });
        }
      });
    }

    ReTrack.AccountsCombo.superclass.constructor.call(this, config);
  },

  selectCurrent: function() {
    var comp = this;
    comp.getStore().reload({
      callback: function() {
        Ext.Ajax.request({
          url: 'bts_accounts/show_current.json',
          method: 'get',
          success: function(resp) {
            var respObj = Ext.util.JSON.decode(resp.responseText);
            if(respObj.success) {
              comp.setValue(respObj.account.id);
              if(comp.accountSelect) {
                comp.accountSelect(respObj.account);
              }
            } else {
            }
          },
          failure: function() {
          }
        });
      }
    });
  }
});
