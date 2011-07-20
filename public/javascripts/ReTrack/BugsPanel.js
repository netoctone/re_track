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
        accCombo,
        {
          text: 'Refresh',
          handler: function() {
            accCombo.selectById(accCombo.getValue());
          }
        }
      ]
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.BugsPanel.superclass.initComponent.apply(this, arguments);
  }, //eo function initComponent

  constructor: function(config) {
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
      url: 'defects/grid_config.json' +
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
    var comp = this;
    var cols_and_fields = ReTrack.util.buildColsAndFieldsConfig(config);
    var cols = cols_and_fields.cols;
    var fields = cols_and_fields.fields;
    var sendFields = cols_and_fields.sendFields;
    var filters = cols_and_fields.filters;

    var grid = new Ext.grid.EditorGridPanel({
      itemId: 'defectGrid',
      border: false,
      tbar: [
        {
          text: 'Details',
          handler: function() {
            var cell = grid.getSelectionModel().getSelectedCell();
            if(cell) {
              grid.showBugDetails(cell[0]);
            }
          }
        }
      ],
      ds: function() {
        var ds = new Ext.data.JsonStore({//handle errors (bts not available ...)
          proxy: new Ext.data.HttpProxy({
            url: 'defects/show_all.json',
            timeout: 10*60*1000
          }),
          root: 'defects',
          fields: fields,
          autoLoad: true
        });
        new Ext.LoadMask(comp.getId(), { msg: 'Loading bugs...', store: ds });
        return ds;
      }(),
      cm: new Ext.grid.ColumnModel({
        defaultSortable: true,
        columns: cols
      }),
      plugins: new Ext.ux.grid.GridFilters({
        local: true,
        filters: filters
      }),
      clicksToEdit: 1,
      listeners: {
        celldblclick: function(grid, row) {
          grid.showBugDetails(row);
        },
        afteredit: function(editEvent) {
          Ext.Ajax.request({
            url: 'defects/update.json',
            params: function() {
              res = {};
              var data = editEvent.record.data;
              for(var field in sendFields) {
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
    grid.showBugDetails = function(row) {
      var form = new ReTrack.FunctionalForm({
        functional: {
          subject: 'defect',
          dataConfig: config
        },
        border: false
      });
      var record = this.getStore().getAt(row);
      form.updateSubject(record.data);
      new Ext.Window({
        title: 'Bug details',
        resizable: false,
        padding: 10,
        buttons: [
          {
            text: 'Update',
            handler: function() {
              form.submitUpdate({
                success: function() {
                  Ext.apply(record.data, form.getSubject());
                  record.commit();
                },
                failure: function(errormsg) {
                  Ext.Msg.alert('Error', errormsg);
                }
              });
            }
          }
        ],
        items: [
          form
        ]
      }).show();
    }
    return grid;
  }
});
