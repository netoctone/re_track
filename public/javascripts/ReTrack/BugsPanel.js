Ext.ns('ReTrack');

ReTrack.BugsPanel = Ext.extend(Ext.Panel, {
  initComponent: function() {
    var config = {
      title: 'Bugs',
      html: 'bugs panel'
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.BugsPanel.superclass.initComponent.apply(this, arguments);
  }
});
