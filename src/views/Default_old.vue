<template>
  <div class="container">

    <div class="section">
      <div class="parts">
        <div class="heading">AI Chat Logs</div>
        <div class="dataLogs" style="max-height: 100vh; border-bottom: 1px solid #eee;" v-for="(item, index) in data" :key="index" @click="select(item)" :class="{ selected: item.humanTrackingId === humanTrackingId }">

          <div style="width:100%;float: left;margin-bottom: 10px;"><span class="dateLog">
              {{ item.stamp | formatDateTime }}</span> |
            <span style="color: #808080;font-size: smaller;">Tracking ID: {{ item.humanTrackingId }}</span>
            <span v-if="item.functionName != ''" style="color: #1b74eb;font-size: smaller;"> | Function executed: {{ item.functionName }}</span>
          </div>
          <div style="width:100%;float: left;margin-bottom: 10px;">
            <div style="width:50px;float: left;">
              <span class="badge">Human</span>
            </div>
            <div style="width:Calc(100% - 50px);float: left;"><span class="response">{{ item.humanInput }}</span></div>
          </div>

          <div style="width:100%;float: left;;margin-bottom: 10px;">
            <div style="width:50px;float: left;">
              <span class="badge" style="background-color: #009fdb;color:white;">AI</span>
            </div>
            <div style="width:Calc(100% - 50px);float: left;"><span class="response">{{ item.AI_response }}</span></div>
          </div>


        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="section">
      <div class="parts">
        <div class="heading">Available Functions</div>
        <div class="data" style="max-height: 500px;">
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
      </div>

      <h3>AI Response Details</h3>

      <div class="parts">
        <div class="heading">Function description</div>
        <div class="data" style="max-height: 50px;">
          {{ description }}
        </div>
      </div>

      <div class="parts">
        <div class="heading">Function arguments:</div>
        <div class="data" style="max-height: 300px;padding:0px">
          <div class="json"><vue-json-pretty :data="funcArgs" /></div>
        </div>
      </div>

      <div class="innercontainer">
        <div class="innersection">
          <div class="parts">
            <div class="heading">Token usage:</div>
            <div class="data" style="max-height: Calc(100vh - 690px);padding:0px">
              <div class="json"> <vue-json-pretty :data="tokenUsage" /></div>
            </div>
          </div>
        </div>
        <div class="innersection">
          <div class="parts">
            <div class="heading">Content filter:</div>
            <div class="data" style="max-height: Calc(100vh - 690px);;padding:0px">
              <div class="json"> <vue-json-pretty :data="contentFilter" /></div>
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
  /* eslint-disable */
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
    fingerprint: "",
    funcArgs: {},
    functionName: "",
    data: [],
    index: -1
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



      if (parsedObj.input) { //-------------------------------------------------this comes from api
        if (parsedObj != null && parsedObj.additional_kwargs == "") {
          this.functionName = "",
            this.description ="No function is executed";
          this.humanInput = parsedObj.input.content;
          this.AI_response = parsedObj.response.content;
          this.model = parsedObj.response.response_metadata.model_name;
          this.tokenUsage = parsedObj.response.response_metadata.token_usage;
          this.contentFilter = parsedObj.response.response_metadata.prompt_filter_results[0].content_filter_results;//[0].content_filter_result;
          this.humanTrackingId = parsedObj.input.id;
          this.funcArgs=null
        }
        else {
          functions.forEach((func) => {
            if (func.functionName == (parsedObj ? parsedObj.additional_kwargs.tool_calls[0].function.name : '')) {
              func.active = true;
              func.functionName = parsedObj.additional_kwargs.tool_calls[0].function.name;
              this.functionName = parsedObj.additional_kwargs.tool_calls[0].function.name;
              this.description = func.description;
              this.humanInput = parsedObj.input.content;
              this.AI_response = parsedObj.response.content;
              this.model = parsedObj.response.response_metadata.model_name;
              this.tokenUsage = parsedObj.response.response_metadata.token_usage;
              this.contentFilter = parsedObj.response.response_metadata.prompt_filter_results[0].content_filter_results;//[0].content_filter_result;
              this.funcArgs = parsedObj.additional_kwargs.tool_calls[0];
              this.humanTrackingId = parsedObj.input.id;
            }
          });
        }
        var datatems = {
          functionName: this.functionName,
          description: this.description,
          humanInput: this.humanInput,
          AI_response: this.AI_response,
          model: this.model,
          tokenUsage: this.tokenUsage,
          contentFilter: this.contentFilter,
          funcArgs: this.funcArgs,
          humanTrackingId: this.humanTrackingId,
          functions: functions,
          stamp: Date.now(),
          index: this.index + 1
        }

        this.data.push(datatems)
        this.data.sort((a, b) => b.stamp - a.stamp);
      }
      else //----------------------------------------------------------------------- this come from click
      {
        console.log('parsedObj',parsedObj)
        if (parsedObj.functionName == "") {
          this.functionName = "",
            this.description = "No function is executed";;
          this.humanInput = parsedObj.humanInput;
          this.AI_response = parsedObj.AI_response;
          this.model = parsedObj.model;
          this.tokenUsage = parsedObj.tokenUsage;
          this.contentFilter = parsedObj.contentFilter;
          this.humanTrackingId = parsedObj.humanTrackingId;
          this.funcArgs = null;
        }
        else {
          functions.forEach((func) => {
            if (func.functionName == (parsedObj.functionName)) {
              func.active = true;
              func.functionName = parsedObj.functionName;
              this.functionName = parsedObj.functionName;
              this.description = func.description
              this.humanInput = parsedObj.humanInput;
              this.AI_response = parsedObj.AI_response;
              this.model = parsedObj.model;
              this.tokenUsage = parsedObj.tokenUsage;
              this.contentFilter = parsedObj.contentFilter;
              this.humanTrackingId = parsedObj.humanTrackingId;
              this.funcArgs = parsedObj.funcArgs;
            }
          });
        }
      }

      return functions;
    },
  },
  methods: {
    select: function (item) {
      this.message = item;
    },

  },
  mounted() {
    this.socket = new WebSocket('ws://ailogs-bkh5bsehgbhpgga7.eastus-01.azurewebsites.net');
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
#app
{
  margin-top: 0px!important;
}
body {
  display: flex;
  justify-content: center;
  height: 100vh;
  background-color: #2c2c2c;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  width: 90%;
  max-width: 1700px;
  height: 95vh;
  margin: auto;
}

.section {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.json {
  background-color: #f3f3f3;
  padding: 10px
}

.innercontainer {
  display: grid;
  grid-template-columns: 1fr 1fr;

  width: 100%;
  max-width: 1700px;
  height: 100vh;
  margin: auto;
}

.innersection {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 10px;
}

.section h3 {
  background-color: #f9f9f9;
  color: #333;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #ddd;
  font-size: 14px;
  font-weight: bold;
}

.parts {
  // background-color: bisque;
  text-align: left;
  margin-bottom: 10px;
}

.heading {
  padding: 7px;
  background-color: #404040;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.data {
  padding: 10px;
  // background-color: rgb(235, 36, 69);
  font-size: 13px;
  font-weight: 600;
  overflow-y: auto;
  float: left;
  width: 100%;
}

.dataLogs {
  transition: 0.3s;
  padding: 10px;
  // background-color: rgb(235, 36, 69);
  font-size: 13px;
  font-weight: 600;
  overflow-y: auto;
  float: left;
  width: 100%;
}

.selected {
  transition: 0.3s;
  padding: 10px;
  font-size: 13px;
  font-weight: 600;
  overflow-y: auto;
  float: left;
  width: 100%;
  border-left: 7px solid #13ce66;
  padding-left: 12px;
}

.dataLogs:hover {
  transition: 0.3s;
  // border-left: 7px solid #13ce66;
  background-color: #f3f3f3;

  cursor: pointer;
}

.badge {
  padding: 5px;
  width: 50px;
  font-size: smaller;
  background-color: #13ce66;
  border-radius: 7px;
  margin-right: 7px;
  text-align: center;
  float: right;
  color:white
}

.response {

  line-height: 20px;
 
}

.dateLog {
  color: #bf0000;
  font-size: smaller;
}

.activeRow {
  background-color: #fafaed;
  transition: 0.3s;
  color: #188bd5;
  font-weight: 600;
}

.list-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #ddd;
  font-size: 1rem;
  font-weight: 300;
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

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
    height: auto;
  }

}
</style>