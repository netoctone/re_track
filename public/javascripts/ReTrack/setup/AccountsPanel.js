Ext.ns('ReTrack');

ReTrack.AccountsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var topBar = this.topBar = new Ext.Toolbar();
    var config = {
      title: 'Accounts',
      tbar: topBar
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.AccountsPanel.superclass.initComponent.apply(this, arguments);
  },

  constructor: function(config) {
    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      show: function(comp) {
        if(comp.combo) {
          comp.combo.selectCurrent();
        } else {
          comp.loadSelf();
        }
      }
    });

    ReTrack.AccountsPanel.superclass.constructor.call(this, config);
  }, // eo function constructor

  loadSelf: function() {
    var comp = this;
    ReTrack.functional.loadFunctionalEdit({
      functional: {
        subject: 'bts_account',
        form: {
          labelWidth: 60
        },
        formCard: {
          title: 'Account',
          width: 340
        },
        callback: {
          load: {
            success: function(combo, buttonNew, formCard) {
              comp.buildSelf(combo, buttonNew, formCard);
            },
            failure: function(errormsg) {
              Ext.Msg.alert('Error', errormsg);
            }
          },
          subjectSelect: {
            success: function(account) {
            },
            failure: function(errormsg) {
            }
          },
          subjectDeselect: function() {//can't fail
          }
        }
      }
    });
  },

  buildSelf: function(combo, button, card) {
    this.combo = combo;

    this.topBar.add([combo, button]);
    this.add(card);
    this.doLayout();

    combo.selectCurrent();
  }
});
