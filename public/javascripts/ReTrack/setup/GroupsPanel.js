Ext.ns('ReTrack');

ReTrack.GroupsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var accGridConf = {
      user_name: {
        header_name: 'User',
        type: 'string'
      },
      user_email: {
        header_name: 'User email',
        type: 'string'
      },
      bts: {
        header_name: 'BTS',
        type: 'string'
      },
      login: {
        header_name: 'BTS login',
        type: 'string'
      }
    };

    var cols_and_fields = ReTrack.util.buildColsAndFieldsConfig(accGridConf);
    cols_and_fields.fields.push('id');

    var accOfGroupGrid = undefined;
    var accOfGroupGridConf = {
      border: false,
      ds: new Ext.data.JsonStore({
        proxy: new Ext.data.HttpProxy({
          url: 'account_groups/acc_list.json',
          method: 'get'
        }),
        root: 'list',
        fields: cols_and_fields.fields,
      }),
      cm: new Ext.grid.ColumnModel({
        columns: cols_and_fields.cols
      }),
      sm: new Ext.grid.RowSelectionModel(),
      bbar: [
        {
          text: 'Remove selected from group',
          handler: function() {
            var records = accOfGroupGrid.getSelectionModel().getSelections();
            if(records.length != 0) {
              var accIdList = [];
              for(var i in records) {
                accIdList.push(records[i].id);
              }
              Ext.Ajax.request({
                url: 'account_groups/remove_acc.json',
                method: 'delete',
                params: {
                  groupId: accOfGroupGrid.getGroupId(),
                  accIdList: Ext.encode(accIdList)
                },
                success: function(resp) {
                  var respObj = Ext.decode(resp.responseText);
                  if(respObj.success) {
                    accOfGroupGrid.renew();
                    accToAddCombo.renew();
                  } else {
                    Ext.Msg.alert('Error', respObj.errormsg);
                  }
                },
                failure: function() {
                  Ext.Msg.alert('Error', 'Server not responding');
                }
              });
            }
          }
        }
      ]
    };
    accOfGroupGrid = new Ext.grid.GridPanel(accOfGroupGridConf);
    Ext.apply(accOfGroupGrid, function() {
      var groupIdMem = undefined;
      return {
        renew: function(groupId) {
          if(groupId) {
            groupIdMem = groupId;
          } else {
            groupId = groupIdMem;
          }

          var store = this.getStore();
          store.proxy.setUrl('account_groups/acc_list.json' +
                             Ext.urlEncode({ id: groupId }, '?'));
          store.reload();
        },
        getGroupId: function() {
          return groupIdMem;
        }
      }
    }());
    this.accOfGroupGrid = accOfGroupGrid;

    var accToAddGrid = undefined;
    var accToAddCombo = undefined;
    var accToAddGridConf = {
      border: false,
      ds: new Ext.data.JsonStore({
        proxy: new Ext.data.HttpProxy({
          url: 'account_groups/acc_add_list.json',
          method: 'get'
        }),
        root: 'list',
        fields: cols_and_fields.fields
      }),
      columns: cols_and_fields.cols,
      sm: new Ext.grid.RowSelectionModel(),
      bbar: [
        {
          text: 'Add selected to group',
          handler: function() {
            var records = accToAddGrid.getSelectionModel().getSelections();
            if(records.length != 0) {
              var idList = [];
              for(var i in records) {
                idList.push(records[i].id);
              }
              Ext.Ajax.request({
                url: 'account_groups/add_acc.json',
                method: 'post',
                params: {
                  groupId: accToAddCombo.getGroupId(),
                  accIdList: Ext.encode(idList)
                },
                success: function(resp) {
                  var respObj = Ext.decode(resp.responseText);
                  if(respObj.success) {
                    accOfGroupGrid.renew();
                    accToAddCombo.renew();
                  } else {
                    Ext.Msg.alert('Error', respObj.errormsg);
                  }
                },
                failure: function() {
                  Ext.Msg.alert('Error', 'Server not responding');
                }
              });
            }
          }
        }
      ]
    };
    accToAddGrid = new Ext.grid.GridPanel(accToAddGridConf);
    accToAddCombo = this.accToAddCombo = new Ext.form.ComboBox({
      mode: 'local',
      store: {
        xtype: 'jsonstore',
        url: 'func/bts_list.json',
        root: 'list',
        fields: ['display', 'value'],
        autoLoad: true
      },
      displayField: 'display',
      valueField: 'value',
      emptyText: 'no bts',
      editable: false,
      triggerAction: 'all',
      listeners: {
        select: function(combo) {
          combo.renew();
        }
      }
    });
    Ext.apply(accToAddCombo, function() {
      var groupIdMem = undefined;
      return {
        renew: function(groupId) {
          if(groupId) {
            groupIdMem = groupId;
          } else {
            groupId = groupIdMem;
          }

          var bts = this.getValue();
          if(bts && bts.length != 0) {
            var store = accToAddGrid.getStore();
            store.proxy.setUrl('account_groups/acc_add_list.json' +
                               Ext.urlEncode({ id: groupId, bts: bts }, '?'));
            store.reload();
          }
        },
        getGroupId: function() {
          return groupIdMem;
        }
      };
    }());


    var topBar = this.topBar = new Ext.Toolbar();

    var accToAdd = this.accToAdd = new Ext.Panel({
      flex: 1,
      title: 'add account',
      hidden: true,
      layout: 'fit',
      tbar: [
        accToAddCombo
      ],
      items: [
        accToAddGrid
      ]
    });

    var accOfGroup = this.accOfGroup = new Ext.Panel({
      flex: 1,
      border: false,
      hidden: true,
      layout: 'fit',
      items: [
        accOfGroupGrid
      ]
    });
    var group = this.group = new Ext.Panel({
      flex: 1,
      title: 'Group',
      layout: 'vbox',
      layoutConfig: {
        align: 'stretch'
      },
      items: [
        accOfGroup
      ]
    });

    var config = {
      title: 'Groups',
      border: false,
      layout: 'hbox',
      layoutConfig: {
        align: 'stretch'
      },
      tbar: topBar,
      items: [
        group,
        accToAdd
      ]
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.GroupsPanel.superclass.initComponent.apply(this, arguments);
  }, // eo function initComponent

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

    ReTrack.GroupsPanel.superclass.constructor.call(this, config);
  }, // eo function constructor

  loadSelf: function() {
    var comp = this;
    ReTrack.functional.loadFunctionalEdit({
      functional: {
        subject: 'account_group',
        form: {
          labelWidth: 50
        },
        formCard: {
          autoHeight: true,
          maxWidth: 260,
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
            success: function(group) {
              comp.accOfGroupGrid.renew(group.id);
              comp.accToAddCombo.renew(group.id);

              comp.accOfGroup.setVisible(true);
              comp.accToAdd.setVisible(true);
              comp.doLayout();
            },
            failure: function(errormsg) {
            }
          },
          subjectDeselect: function() {//can't fail
            comp.accOfGroup.setVisible(false);
            comp.accToAdd.setVisible(false);
            comp.doLayout();
          }
        }
      }
    });
  },

  buildSelf: function(combo, button, card) {
    this.topBar.add([combo, button]);
    this.group.insert(0, card);
    this.doLayout();

    this.combo = combo;
    combo.selectCurrent();
  }

});
