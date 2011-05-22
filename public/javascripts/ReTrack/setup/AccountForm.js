Ext.ns('ReTrack');

ReTrack.AccountForm = Ext.extend(Ext.form.FormPanel, {
  initComponent: function() {
    var config = {
      border: false,
      items: [
        {
          xtype: 'textfield',
          fieldLabel: 'Name',
          name: 'bts_account[name]',
          allowBlank: false,
          blankText: 'name is required'
        },
        {
          xtype: 'combo',
          fieldLabel: 'BTS',
          editable: false,
          mode: 'local',
          store: new Ext.data.JsonStore({
            url: 'func/bts_list.json',
            root: 'bts_list',
            fields: ['name'],
            autoLoad: true
          }),
          valueField: 'name',
          displayField: 'name',
          name: 'bts_account[bts]',
          allowBlank: false,
          blankText: 'BTS is required'
        },
        {
          xtype: 'textfield',
          fieldLabel: 'Login',
          name: 'bts_account[login]',
          allowBlank: false,
          blankText: 'login is required'
        },
        {
          xtype: 'textfield',
          inputType: 'password',
          fieldLabel: 'Password',
          name: 'bts_account[password]',
          allowBlank: false,
          blankText: 'password is required'
        }
      ]
    };

    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.AccountForm.superclass.initComponent.apply(this, arguments);
  }
});
