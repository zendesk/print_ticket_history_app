/*global Blob*/
/*global URL*/

(function() {

  return {
    events: {
      'app.created':'init',
      'click .displayList': 'startDL',
      'getTickets.done': 'results',
      'click .checkbox1': 'validateCheckbox',
      'click .checkbox2': 'validateCheckbox',
      'click .checkbox3': 'validateCheckbox',
    },

    requests: {
      printTicket: function(ticket_id){
        return{
          url: '/tickets/'+ ticket_id +'/print',
          type: 'GET',
          cors: true,
          contentType: 'text/html',
          success: function(data) {this.concatPrint(data, ticket_id);}
        };
      },

      getTickets: function(url){
        return {
          url: url
        };
      }
    },

    init: function(){
      this.switchTo('generate');
      this.validateCheckbox();
      this.tickets = [];
      this.ticketIds = [];
      this.userName = this.currentUser().name();
    },
    validateCheckbox: function(){
      if(!this.$('#filterCheckbox1').is(':checked')&&
          !this.$('#filterCheckbox2').is(':checked')&&
          !this.$('#filterCheckbox3').is(':checked'))
      {
        this.$('.displayList').prop('disabled', true);
      } else {
        this.$('.displayList').prop('disabled', false);
      }
    },
    startDL: function() {
      if (this.$('#filterCheckbox1').is(':checked')){
        var searchQuery = encodeURIComponent( 'commenter:' + this.user().id() ),
        initURL = '/api/v2/search.json?page=1&query=' + searchQuery;
        this.ajax('getTickets', initURL);
        this.switchTo('loading');
      }
      if (this.$('#filterCheckbox2').is(':checked')){
        var searchQueryRequester = encodeURIComponent( 'requester:' + this.user().id() ),
        initURLRequester = '/api/v2/search.json?page=1&query=' + searchQueryRequester;
        this.ajax('getTickets', initURLRequester);
        this.switchTo('loading');
      }
      if (this.$('#filterCheckbox3').is(':checked')) {
        var searchQueryCC = encodeURIComponent( 'cc:' + this.user().id() ),
        initURLCC = '/api/v2/search.json?page=1&query=' + searchQueryCC;
        this.ajax('getTickets', initURLCC);
        this.switchTo('loading');
      }
    },

    results: function(data){
      var results = data.results,
        nextPage = data.next_page;
      results.forEach(function(x){
        this.ticketIds.push(x.id);
      }, this);
      if(nextPage !== null){
        this.ajax('getTickets', nextPage);
      } else {
        this.printForm();
      }
    },

    printForm: function(){
      this.ticketIds = _.uniq(this.ticketIds);
      this.ticketIds.forEach(function(x){
        this.ajax('printTicket', x);
      }, this);
    },

    concatPrint: function(data, ticket_id){
      var subdomain = this.currentAccount().subdomain();
      var imagePath = helpers.fmt('http://%@.zendesk.com/images/zendesk-lotus-flower.png', subdomain);
      data = data.replace('/images/zendesk-lotus-flower.png', imagePath);
      this.tickets.push(data);
      if(this.ticketIds.length === this.tickets.length){
        this.createURL();
      }
    },
    createURL: function() {
      var blob = new Blob(this.tickets, {type : 'text/html'});
      var url = URL.createObjectURL( blob );
      this.switchTo('_ticketTemplate',{
        url: url,
        userName: this.userName
      });
    }
  };

}());
