Ext.ns('ReTrack');

ReTrack.MainViewport = Ext.extend(Ext.Viewport, {
  initComponent: function() {
    var centerCardPanel = new Ext.Panel({
      region: 'center',
      border: false,
      layout: 'card',
      activeItem: 0,
      items: [
        new ReTrack.WorkPanel(),
        new ReTrack.SetupPanel()
      ]
    });

    var config = {
      layout: 'border',
      items: [
        new ReTrack.MainHeader({
          region: 'north',
          listeners: {
            modeSelect: function(mode) {
              if(mode === ReTrack.MainHeader.WORK) {
                centerCardPanel.getLayout().setActiveItem(0);
              } else if(mode == ReTrack.MainHeader.SETUP) {
                centerCardPanel.getLayout().setActiveItem(1);
              }
            }
          }
        }),
        centerCardPanel,
        new ReTrack.MainFooter({ region: 'south' })
      ]
    };
    
    Ext.apply(this, Ext.apply(this.initialConfig, config));

    ReTrack.MainViewport.superclass.initComponent.apply(this, arguments);
  }
});
