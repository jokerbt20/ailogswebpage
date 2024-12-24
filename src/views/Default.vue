<template>
  <div>
    <div class="container">
      <div class="leftColumn">
        <div class="list-section">
          <h3>Available Functions</h3>
          <div class="list-item" v-for="(item, index) in theMessage" :key="index" :class="{
            activeRow: item.active == true,
            inactiveRow: item.active == false,
          }">
            <span :class="{
              activeRow: item.active == true,
              inactiveRow: item.active == false,
            }">{{ item.functionName }}</span>
            <span class="status" :class="{
              active: item.active == true,
              inactive: item.active == false,
            }"> </span>
          </div>
        </div>
        <div class="list-section logs" >

        </div>
      </div>
      <!-- Second Section: Logs -->
      <div class="rightColumn">
        <div class="container1 list-section">
          <!-- Human Input -->
          <div class="section1">
            <label for="human-input">Human input <span style="font-size: small;float: right;color: #6a6a6a;" v-if="humanTrackingId!=''">Tracking id : {{ humanTrackingId }}</span></label>
            <input id="human-input" type="text" class="input-box" v-model="humanInput" />
          </div>

          <!-- AI Response -->
          <div class="section1">
            <label for="ai-response">AI response</label>
            <textarea id="ai-response" class="textarea" v-model="AI_response"></textarea>
          </div>

          <!-- AI Response Details -->
          <div class="section1 sectionDetails">
            <div class="response-header">AI response details</div>
            <div class="details-container" >
              <span style="width:160px;float:left"> <label for="function-executed" style="margin-top:20px ; float: left;">Function description</label></span>
              <span style="width:500px;float:left">  <input id="function-executed" type="text" class="small-input" v-model="description" /></span>
            </div>
           
          

            <div class="details-container">
              <div class="details-box">
                <p><strong>Function arguments:</strong></p>
                <div class="json"><vue-json-pretty :data="funcArgs" /></div>
              </div>             
            </div>
            <div class="details-container">            
              <div class="details-box">
                <p><strong>Model:</strong> {{ model }} | <strong>Token usage:</strong></p>
                <div class="json"><vue-json-pretty :data="tokenUsage" /></div>
              </div>
              <div class="details-box">
                <p><strong>Content filter results:</strong></p>
                <div class="json"><vue-json-pretty :data="contentFilter" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css';
export default {

  name: "TableSearch",
  components: {
    VueJsonPretty,
  },
  data: () => ({
    socket: null,
    message: null,
    humanInput: "",
    humanTrackingId: "",
    AI_response: "",
    model: "",
    tokenUsage: {},
    contentFilter: {},
    description: "",
    funcArgs:{}
  }),
  computed: {
    theMessage() {

      const obj = this.message;
      let parsedObj;
      /* eslint-disable */
      try {
        parsedObj = typeof obj === "string" ? JSON.parse(obj) : obj;
      } catch (error) {
        console.error("Invalid JSON:", error.message);
        parsedObj = {};
      }

      let functions = [
          { "functionName": "RoamingPlanAlert", "description": "Set an alert to notify the user when they reach a percentage of their data usage", "active": false },
          { "functionName": "RoamingPlan", "description": "Activate a roaming plan", "active": false },
          { "functionName": "ApplicationAccessTime", "description": "Set a daily restriction of a mobile application in hours", "active": false },
          { "functionName": "ApplicationAccessBlock", "description": "Completely restrict or allow the usage of a mobile application", "active": false },
          { "functionName": "ApplicationAccessAlert", "description": "Set an alert to notify the user", "active": false },
        ];

        if (parsedObj == null) {
        return functions
      }

      if (parsedObj != null && parsedObj.additional_kwargs == "") {
        this.description = "No function is executed";
        this.humanInput = parsedObj.input.content;
        this.AI_response = parsedObj.response.content;
        this.model = parsedObj.response.response_metadata.model_name;
        this.tokenUsage = parsedObj.response.response_metadata.token_usage;
        this.contentFilter = parsedObj.response.response_metadata.prompt_filter_results[0].content_filter_results;//[0].content_filter_result;
        this.humanTrackingId = parsedObj.input.id
      }
      else {
        
        // console.log('parsedObj.additional_kwargs.tool_calls[0].function.name', parsedObj.additional_kwargs.tool_calls[0] ? parsedObj.additional_kwargs.tool_calls[0].function.name : '')
        functions.forEach((func) => {
          if (func.functionName == (parsedObj ? parsedObj.additional_kwargs.tool_calls[0].function.name : '')) {
            func.active = true;
            func.functionName = parsedObj.additional_kwargs.tool_calls[0].function.name;
            this.description = func.description;
            this.humanInput = parsedObj.input.content;
            this.AI_response = parsedObj.response.content;
            this.model = parsedObj.response.response_metadata.model_name;
            this.tokenUsage = parsedObj.response.response_metadata.token_usage;
            this.contentFilter = parsedObj.response.response_metadata.prompt_filter_results[0].content_filter_results;//[0].content_filter_result;
            this.funcArgs = parsedObj.additional_kwargs.tool_calls[0];
            this.humanTrackingId = parsedObj.input.id
          }
        });
      }
      console.log('functions', functions)
      console.log('this.humanInput', this.humanInput)
      console.log(' this.AI_response', this.AI_response)
      console.log('this.model', this.model)
      console.log('this.tokenUsage', this.tokenUsage)
      console.log('this.contentFilter', this.contentFilter)
      // Return the parsed object
      return functions;
    },
  },
  methods: {
    getData: function () {

    },

  },
  mounted() {
    this.socket = new WebSocket('ws://localhost:3000');
    this.socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    this.socket.onmessage = (event) => {
      this.message = event.data;
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket Error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close();
    }
  },

};

</script>

<style lang="scss" scoped>
/* Global Reset */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Body and basic styling */
body {
  font-family: 'Arial', sans-serif;
  background-color: #f4f4f9;
  color: #333;
  padding: 20px;
  font-size: 2rem !important;
}

/* Header styling */
header {
  background-color: #0044cc;
  color: white;
  padding: 20px;
  text-align: center;
  font-size: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

/* Container to hold sections */
.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

/* First section - Name and active flags */
.list-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.list-section h3 {
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-size: 1rem;
}

.list-item:last-child {
  border-bottom: none;
}

.status {
  transition: 0.5s;
  font-weight: normal;
  width: 17px;
  border-radius: 17px;
}

.status.active {
  background-color: #8fdb00;
  -webkit-box-shadow: 0px 4px 16px -7px rgba(0, 0, 0, 0.75);
  -moz-box-shadow: 0px 4px 16px -7px rgba(0, 0, 0, 0.75);
  box-shadow: 0px 4px 16px -7px rgba(0, 0, 0, 0.75);
}

.status.inactive {
  background-color: #b3012d;
}

/* Second section - Logs */
.logs-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.logs-section h3 {
  margin-bottom: 15px;
  font-size: 1.5rem;
}

textarea {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ddd;
  background-color: #fafafa;
  resize: none;
}

.activeRow {
  background-color: #fafaed;
  transition: 1s;
}

.leftColumn {

  float: left;
  height: 90vh;
}

.rightColumn {

  float: right;
  height: 90vh;
}

.container1 {
  width: 100%;
  //max-width: 800px;
}

.section1 {
  margin-bottom: 20px;
  text-align: left;
}

.sectionDetails {
  background-color: #e4e8eb;
  padding: 10px;
  border-radius: 5px;
}

.section1 label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  text-align: left;
}

.input-box {
  width: 100%;
  height: 40px;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.textarea {
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: medium;
}

.response-header {
  background-color: #636789;
  color: #fff;
  padding: 10px;
  font-size: 1.1em;
  font-weight: bold;
  border-radius: 4px;
}

.details-container {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.details-box {
  flex: 1;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.json {
  margin-top: 10px;
}

.small-input {
  width: 100%;
  height: 40px;
  margin-top: 10px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
</style>