Ext.ns('ReTrack');

ReTrack.ReportsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var comp = this;
    var groupCombo = this.groupCombo = new ReTrack.FunctionalCombo({
      functional: {
        subject: 'account_group',
        subjectSelectCallback: {
          failure: function(errormsg) {
            Ext.Msg.alert('Notification', errormsg);
          }
        }
      }
    });

    var config = {
      title: 'Reports',
      layout: 'vbox',
      layoutConfig: {
        align: 'stretch'
      },
      tbar: [
        groupCombo
      ],
      items: []
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.ReportsPanel.superclass.initComponent.apply(this, arguments);

    comp.buildSelf();
  }, // eo function initComponent

  constructor: function(config) {
    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      show: function(comp) {
        comp.groupCombo.selectCurrent();
      }
    });

    ReTrack.ReportsPanel.superclass.constructor.call(this, config);
  },

  buildSelf: function() {
    var fields = [
      'user_name', 'bts_account_name',
      'formatted_id', 'description',
      'start_date', 'end_date',
      'status_name', 'status_percent'
    ];
    var DataRecord = Ext.data.Record.create(fields);

    var grid = new Ext.grid.GridPanel({
      flex: 1,
      itemId: 'trackGrid',
      border: false,
      ds: new Ext.data.JsonStore({
        url: 'fake',
        root: 'fake'
      }, DataRecord),
      cm: new Ext.grid.ColumnModel({
        defaultSortable: false,
        columns: function() {
          var columns = [];
          for(var i = 0; i != fields.length; i++) {
            columns.push({
              header: fields[i],
              dataIndex: fields[i]
            });
          }
          return columns;
        }()
      })
    });

    var form = new Ext.form.FormPanel({
      border: false,
      autoHeight: true,
      labelWidth: 50,
      items: [
        {
          fieldLabel: 'From',
          xtype: 'datefield',
          allowBlank: false,
          name: 'from'
        },
        {
          fieldLabel: 'To',
          xtype: 'datefield',
          allowBlank: false,
          name: 'to'
        }
      ],
      buttons: [
        {
          text: 'Generate',
          type: 'submit',
          handler: function() {
            form.getForm().submit({
              url: 'func/track_show_report_by_date.json',
              method: 'get',
              success: function(form, action) {
                var tracks = action.result.tracks;
                for(var i = 0; i != tracks.length; i++) {
                  tracks[i] = new DataRecord(tracks[i]);
                }
                var store = grid.getStore();
                store.removeAll();
                store.add(tracks);
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
                Ext.Msg.alert('Error', errormsg);
              }
            });
          }
        }
      ]
    });

    this.add([
      {
        border: true,
        autoHeight: true,
        maxWidth: 190,
        layout: 'fit',
        items: [
          form
        ]
      },
      {
        flex: 1,
        border: false,
        layout: 'fit',
        items: [
          grid
        ]
      }
    ]);
    this.doLayout();
  }, // eo function buildSelf
});
