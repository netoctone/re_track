Ext.ns('ReTrack');

ReTrack.BugsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var comp = this;
    var accCombo = this.accCombo = new ReTrack.FunctionalCombo({
      functional: {
        subject: 'bts_account',
        subjectSelectCallback: {
          success: function(account) {
            comp.loadGrid(account['bts_account[bts]']);
          },
          failure: function(errormsg) {
            comp.setGrid();
            Ext.Msg.alert('Notification', errormsg);
          }
        }
      }
    });

    var config = {
      title: 'Bugs',
      layout: 'fit',
      tbar: [
        accCombo
      ]
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.BugsPanel.superclass.initComponent.apply(this, arguments);
  }, //eo function initComponent

  constructor: function(config) {
    var comp = this;

    config = config || {};
    config.listeners = config.listeners || {};
    Ext.applyIf(config.listeners, {
      show: function(comp) {
        comp.accCombo.selectCurrent();
      }
    });

    ReTrack.BugsPanel.superclass.constructor.call(this, config);
  },

  //not used function
  memoizedGetGrid: function() {
    var grids = {};
    return function(bts) {
      return grids[bts] = grids[bts] || this.getGrid(bts);
    }
  }(),

  setGrid: function(grid) {
    var old = this.getComponent('defectGrid');
    if(old) {
      old.destroy();
    }
    if(grid) {
     this.add(grid);
    }
    this.doLayout();
  },

  grids: {},

  selectGrid: function(bts) {
    if(!this.grids[bts]) {
      this.loadGrid(bts);
    } else {
      this.setGrid(this.grids[bts]);
    }
  },

  loadGrid: function(bts) {
    var comp = this;
    Ext.Ajax.request({
      url: 'func/defect_grid_config.json' +
           Ext.urlEncode({ bts: bts }, '?'),
      method: 'get',
      success: function(resp) {
        respObj = Ext.util.JSON.decode(resp.responseText);
        if(respObj.success) {
          var grid = comp.buildGrid(respObj.config);
          comp.grids[bts] = grid;
          comp.setGrid(grid);
        } else {
          Ext.Msg.alert('Error', respObj.errormsg);
        }
      },
      failure: function() {//maybe use passed data?
        Ext.Msg.alert('Connection failure', 'server not responding');
      }
    });
  },

  buildGrid: function(config) {//builds and returns new grid
    //debugger;
    var cm = [];
    var fields = [];
    for(var name in config) {
      var colConf = config[name];
      var col = {};
      if(colConf.header_name) {
        col.header = colConf.header_name;
      } else {
        col.header = name;
      }
      col.dataIndex = name;
      if(!(colConf.editable !== undefined && colConf.editable == false)) {
        if(colConf.type == 'string' || colConf.type == 'text') {
          col.editor = new Ext.form.TextField();
        } else if(colConf.type == 'combo') {
          combo_and_rend = ReTrack.util.buildComboConfig(name,
                                                             colConf.options);
          col.editor = new Ext.form.ComboBox(combo_and_rend.combo);
          col.renderer = combo_and_rend.renderer;
        }
      }

      cm.push(col);
      fields.push(name);
    }
    return new Ext.grid.EditorGridPanel({
      itemId: 'defectGrid',
      //viewConfig: {
      //  forceFit: true
      //},
      border: false,
      ds: new Ext.data.JsonStore({//handle errors (bts not available ...
        proxy: new Ext.data.HttpProxy({
          url: 'func/defect_show_all.json',
          timeout: 10*60*1000
        }),
        root: 'defects',
        fields: fields,
        autoLoad: true
      }),
      cm: new Ext.grid.ColumnModel({
        defaultSortable: false,
        columns: cm
      }),
      clicksToEdit: 1,
      listeners: {
        afteredit: function(editEvent) {
          Ext.Ajax.request({
            url: 'func/defect_update.json',
            params: function() {
              res = {};
              var data = editEvent.record.data;
              for(var field in data) {
                res['defect[' + field + ']'] = data[field];
              }
              return res;
            }(),
            method: 'put',
            success: function(resp) {
              var respObj = Ext.util.JSON.decode(resp.responseText);
              if(respObj.success) {
                editEvent.record.commit();
              } else {
                if(respObj.bts_update_success) {
                  editEvent.record.commit();
                } else {
                  editEvent.record.reject();
                }
                Ext.Msg.alert('Error', respObj.errormsg);
              }
            },
            failure: function() {
              editEvent.record.reject();
              Ext.Msg.alert('Connetion failure', 'server not responding');
            }
          });
        }
      }
    });
  }
});
