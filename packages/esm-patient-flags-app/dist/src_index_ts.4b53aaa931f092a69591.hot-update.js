"use strict";
self["webpackHotUpdate_kenyaemr_esm_patient_flags_app"]("src_index_ts",{

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "backendDependencies": () => (/* binding */ backendDependencies),
/* harmony export */   "importTranslation": () => (/* binding */ importTranslation),
/* harmony export */   "setupOpenMRS": () => (/* binding */ setupOpenMRS)
/* harmony export */ });
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openmrs/esm-framework */ "webpack/sharing/consume/default/@openmrs/esm-framework/@openmrs/esm-framework");
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _config_schema__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config-schema */ "./src/config-schema.ts");


var importTranslation = __webpack_require__("./translations lazy .json$");
var backendDependencies = {
    kenyaemr: "^18.2.0"
};
function setupOpenMRS() {
    var moduleName = "@kenyaemr/esm-patient-flags-app";
    var options = {
        featureName: "patient-flags",
        moduleName: moduleName
    };
    (0,_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.defineConfigSchema)(moduleName, _config_schema__WEBPACK_IMPORTED_MODULE_1__.configSchema);
    return {
        pages: [],
        extensions: [
            {
                name: "patient-flag",
                slot: "patient-banner-tags-slot",
                load: (0,_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.getAsyncLifecycle)(function() {
                    return Promise.all(/*! import() */[__webpack_require__.e("vendors-node_modules_carbon-components-react_es_components_InlineLoading_InlineLoading_js-nod-d3dbbb"), __webpack_require__.e("webpack_sharing_consume_default_react_react"), __webpack_require__.e("src_patient-flags_patient-flags_component_tsx-webpack_sharing_consume_default_carbon-componen-86dc48")]).then(__webpack_require__.bind(__webpack_require__, /*! ./patient-flags/patient-flags.component */ "./src/patient-flags/patient-flags.component.tsx"));
                }, options),
                online: true,
                offline: false
            }, 
        ]
    };
}



/***/ })

});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX2luZGV4X3RzLjRiNTNhYWE5MzFmMDkyYTY5NTkxLmhvdC11cGRhdGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQStFO0FBQ2hDO0FBRS9DLElBQU1HLGlCQUFpQixHQUFHQyxpREFBMkQ7QUFFckYsSUFBTUUsbUJBQW1CLEdBQUc7SUFDMUJDLFFBQVEsRUFBRSxTQUFTO0NBQ3BCO0FBRUQsU0FBU0MsWUFBWSxHQUFHO0lBQ3RCLElBQU1DLFVBQVUsR0FBRyxpQ0FBaUM7SUFFcEQsSUFBTUMsT0FBTyxHQUFHO1FBQ2RDLFdBQVcsRUFBRSxlQUFlO1FBQzVCRixVQUFVLEVBQVZBLFVBQVU7S0FDWDtJQUVEVCwwRUFBa0IsQ0FBQ1MsVUFBVSxFQUFFUCx3REFBWSxDQUFDLENBQUM7SUFFN0MsT0FBTztRQUNMVSxLQUFLLEVBQUUsRUFBRTtRQUNUQyxVQUFVLEVBQUU7WUFDVjtnQkFDRUMsSUFBSSxFQUFFLGNBQWM7Z0JBQ3BCQyxJQUFJLEVBQUUsMEJBQTBCO2dCQUNoQ0MsSUFBSSxFQUFFZix5RUFBaUIsQ0FBQzsyQkFBTSxzZkFBaUQ7aUJBQUEsRUFBRVMsT0FBTyxDQUFDO2dCQUN6Rk8sTUFBTSxFQUFFLElBQUk7Z0JBQ1pDLE9BQU8sRUFBRSxLQUFLO2FBQ2Y7U0FDRjtLQUNGLENBQUM7Q0FDSDtBQUUrRCIsInNvdXJjZXMiOlsid2VicGFjazovL0BrZW55YWVtci9lc20tcGF0aWVudC1mbGFncy1hcHAvLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lQ29uZmlnU2NoZW1hLCBnZXRBc3luY0xpZmVjeWNsZSB9IGZyb20gJ0BvcGVubXJzL2VzbS1mcmFtZXdvcmsnO1xuaW1wb3J0IHsgY29uZmlnU2NoZW1hIH0gZnJvbSAnLi9jb25maWctc2NoZW1hJztcblxuY29uc3QgaW1wb3J0VHJhbnNsYXRpb24gPSByZXF1aXJlLmNvbnRleHQoJy4uL3RyYW5zbGF0aW9ucycsIGZhbHNlLCAvLmpzb24kLywgJ2xhenknKTtcblxuY29uc3QgYmFja2VuZERlcGVuZGVuY2llcyA9IHtcbiAga2VueWFlbXI6ICdeMTguMi4wJyxcbn07XG5cbmZ1bmN0aW9uIHNldHVwT3Blbk1SUygpIHtcbiAgY29uc3QgbW9kdWxlTmFtZSA9ICdAa2VueWFlbXIvZXNtLXBhdGllbnQtZmxhZ3MtYXBwJztcblxuICBjb25zdCBvcHRpb25zID0ge1xuICAgIGZlYXR1cmVOYW1lOiAncGF0aWVudC1mbGFncycsXG4gICAgbW9kdWxlTmFtZSxcbiAgfTtcblxuICBkZWZpbmVDb25maWdTY2hlbWEobW9kdWxlTmFtZSwgY29uZmlnU2NoZW1hKTtcblxuICByZXR1cm4ge1xuICAgIHBhZ2VzOiBbXSxcbiAgICBleHRlbnNpb25zOiBbXG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdwYXRpZW50LWZsYWcnLFxuICAgICAgICBzbG90OiAncGF0aWVudC1iYW5uZXItdGFncy1zbG90JyxcbiAgICAgICAgbG9hZDogZ2V0QXN5bmNMaWZlY3ljbGUoKCkgPT4gaW1wb3J0KCcuL3BhdGllbnQtZmxhZ3MvcGF0aWVudC1mbGFncy5jb21wb25lbnQnKSwgb3B0aW9ucyksXG4gICAgICAgIG9ubGluZTogdHJ1ZSxcbiAgICAgICAgb2ZmbGluZTogZmFsc2UsXG4gICAgICB9LFxuICAgIF0sXG4gIH07XG59XG5cbmV4cG9ydCB7IGJhY2tlbmREZXBlbmRlbmNpZXMsIGltcG9ydFRyYW5zbGF0aW9uLCBzZXR1cE9wZW5NUlMgfTtcbiJdLCJuYW1lcyI6WyJkZWZpbmVDb25maWdTY2hlbWEiLCJnZXRBc3luY0xpZmVjeWNsZSIsImNvbmZpZ1NjaGVtYSIsImltcG9ydFRyYW5zbGF0aW9uIiwicmVxdWlyZSIsImNvbnRleHQiLCJiYWNrZW5kRGVwZW5kZW5jaWVzIiwia2VueWFlbXIiLCJzZXR1cE9wZW5NUlMiLCJtb2R1bGVOYW1lIiwib3B0aW9ucyIsImZlYXR1cmVOYW1lIiwicGFnZXMiLCJleHRlbnNpb25zIiwibmFtZSIsInNsb3QiLCJsb2FkIiwib25saW5lIiwib2ZmbGluZSJdLCJzb3VyY2VSb290IjoiIn0=