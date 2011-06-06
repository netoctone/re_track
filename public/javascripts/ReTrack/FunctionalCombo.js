Ext.ns('ReTrack');

// constructor receives: {
//   functional: {
//     subject: 'name',
//     subjectSelectCallback: {
//       success: function(subject),
//       failure: function(errormsg)
//     }
//   }
// }
//
// methods:
//   selectCurrent(config)
//   selectById(id_or_config)
//   selectNewById(id_or_config)
//   updateCurrentName()
ReTrack.FunctionalCombo = Ext.extend(Ext.form.ComboBox, {
  initComponent: function() {
    var func = this.initialConfig.functional;
    func.controller = ReTrack.util.pluralize(func.subject);

    var config = {
      editable: false,
      mode: 'local',
      store: new Ext.data.JsonStore({
        url: func.controller + '/list.json',
        root: 'list',
        fields: ['id', 'name']
      }),
      emptyText: 'no ' + func.subject,
      valueField: 'id',
      displayField: 'name',
      triggerAction: 'all'
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.FunctionalCombo.superclass.initComponent.apply(this, arguments);

    Ext.apply(this, {
      selectCurrent: function(config) {
        var comp = this;
        var callback = ReTrack.util.buildCallback(config, comp.callback);
        comp.getStore().reload({
          callback: function() {
            Ext.Ajax.request({
              url: func.controller + '/show_current.json',
              method: 'get',
              success: function(resp) {
                var respObj = Ext.util.JSON.decode(resp.responseText);
                if(respObj.success) {
                  comp.setValue(respObj[func.subject].id);
                  callback.success(respObj[func.subject]);
                } else {
                  comp.setValue('');
                  callback.failure(respObj.errormsg);
                }
              },
              failure: function() {
                comp.setValue('');
                callback.failure('Server not responding');
              }
            });
          }
        });
      }, // eo function selectCurrent

      updateCurrentName: function() {
        var comp = this;
        //maybe check if there's no value
        var id = this.getValue();
        comp.getStore().reload({
          callback: function() {
            comp.setValue(id);
          }
        });
      },

      selectById: function(id_or_config) {
        var comp = this;

        var id = undefined;
        var callback = undefined;
        if('number' == typeof id_or_config) {
          id = id_or_config;
          callback = ReTrack.util.buildCallback(undefined, comp.callback);
        } else {
          id = id_or_config.id;
          callback = ReTrack.util.buildCallback(id_or_config, comp.callback);
        }

        comp.setValue(id);

        Ext.Ajax.request({
          url: func.controller + '/update_current.json',
          method: 'put',
          params: {
            id: id
          }
        }); //no need to display if the request successful?

        Ext.Ajax.request({
          url: func.controller + '/show.json' +
               Ext.urlEncode({ id: id }, '?'),
          method: 'get',
          success: function(resp) {
            var respObj = Ext.util.JSON.decode(resp.responseText);
            if(respObj.success) {
              callback.success(respObj[func.subject]);
            } else {
              callback.failure(respObj.errormsg);
            }
          },
          failure: function(resp) {
            callback.failure('Server not responding');
          }
        });
      }, // eo function selectById

      selectNewById: function(id_or_config) {
        var comp = this;
        //maybe check if there's no needed record in a store now
        comp.getStore().reload({
          callback: function() {
            comp.selectById(id_or_config);
          }
        });
      }
    });
  }, //eo function initComponent

  constructor: function(config) {
    if(config && config.functional && config.functional.subjectSelectCallback) {
      this.callback = config.functional.subjectSelectCallback;
    }

    config = config || {};
    config.listeners = config.listeners || {}
    Ext.applyIf(config.listeners, {
      select: function(combo, record) {
        combo.selectById(record.id);
      }
    });

    ReTrack.FunctionalCombo.superclass.constructor.call(this, config);
  } // eo function constructor
});
