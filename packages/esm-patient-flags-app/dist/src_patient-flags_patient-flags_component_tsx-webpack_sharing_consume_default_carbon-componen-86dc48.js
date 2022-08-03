"use strict";
(self["webpackChunk_kenyaemr_esm_patient_flags_app"] = self["webpackChunk_kenyaemr_esm_patient_flags_app"] || []).push([["src_patient-flags_patient-flags_component_tsx-webpack_sharing_consume_default_carbon-componen-86dc48"],{

/***/ "./src/hooks/usePatientFlags.tsx":
/*!***************************************!*\
  !*** ./src/hooks/usePatientFlags.tsx ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "usePatientFlags": () => (/* binding */ usePatientFlags)
/* harmony export */ });
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openmrs/esm-framework */ "webpack/sharing/consume/default/@openmrs/esm-framework/@openmrs/esm-framework");
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var swr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! swr */ "../../node_modules/swr/dist/index.mjs");


/**
 * React hook that takes in a patient uuid and returns
 * patient flags for that patient together with helper objects
 * @param patientUuid Unique patient idenfier
 * @returns An array of patient identifiers
 */ var usePatientFlags = function(patientUuid) {
    var patientFlagsUrl = "/ws/rest/v1/kenyaemr/forms?patientUuid=".concat(patientUuid);
    var ref = (0,swr__WEBPACK_IMPORTED_MODULE_1__["default"])(patientFlagsUrl, _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.openmrsFetch), data = ref.data, mutate = ref.mutate, error = ref.error;
    var ref1;
    var patientFlags = typeof (data === null || data === void 0 ? void 0 : data.data) === "string" ? [] : (ref1 = data === null || data === void 0 ? void 0 : data.data) !== null && ref1 !== void 0 ? ref1 : [];
    return {
        patientFlags: patientFlags,
        isLoading: !data && !error,
        error: error
    };
};


/***/ }),

/***/ "./src/patient-flags/patient-flags.component.tsx":
/*!*******************************************************!*\
  !*** ./src/patient-flags/patient-flags.component.tsx ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @openmrs/esm-framework */ "webpack/sharing/consume/default/@openmrs/esm-framework/@openmrs/esm-framework");
/* harmony import */ var _openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var carbon_components_react__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! carbon-components-react */ "../../node_modules/carbon-components-react/es/components/InlineLoading/InlineLoading.js");
/* harmony import */ var carbon_components_react__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! carbon-components-react */ "../../node_modules/carbon-components-react/es/components/Tag/Tag.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "webpack/sharing/consume/default/react/react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-i18next */ "webpack/sharing/consume/default/react-i18next/react-i18next");
/* harmony import */ var react_i18next__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_i18next__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _hooks_usePatientFlags__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../hooks/usePatientFlags */ "./src/hooks/usePatientFlags.tsx");





var PatientFlags = function(param) {
    var patientUuid = param.patientUuid;
    var t = (0,react_i18next__WEBPACK_IMPORTED_MODULE_2__.useTranslation)().t;
    var ref = (0,_hooks_usePatientFlags__WEBPACK_IMPORTED_MODULE_3__.usePatientFlags)(patientUuid), patientFlags = ref.patientFlags, isLoading = ref.isLoading, error = ref.error;
    if (isLoading) {
        return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1___default().createElement(carbon_components_react__WEBPACK_IMPORTED_MODULE_4__["default"], {
            description: t("loading", "Loading...")
        });
    }
    if (error) {
        /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1___default().createElement(_openmrs_esm_framework__WEBPACK_IMPORTED_MODULE_0__.ErrorState, {
            error: error,
            headerTitle: t("errorPatientFlags", "Patient flags error")
        });
    }
    if (patientFlags.length) {
        /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1___default().createElement((react__WEBPACK_IMPORTED_MODULE_1___default().Fragment), null, patientFlags.map(function(patientFlag) {
            return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1___default().createElement(carbon_components_react__WEBPACK_IMPORTED_MODULE_5__["default"], {
                type: "magenta"
            }, patientFlag);
        }));
    }
    return /*#__PURE__*/ react__WEBPACK_IMPORTED_MODULE_1___default().createElement("div", null);
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PatientFlags);


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3JjX3BhdGllbnQtZmxhZ3NfcGF0aWVudC1mbGFnc19jb21wb25lbnRfdHN4LXdlYnBhY2tfc2hhcmluZ19jb25zdW1lX2RlZmF1bHRfY2FyYm9uLWNvbXBvbmVuLTg2ZGM0OC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXNEO0FBQzdCO0FBUXpCOzs7OztHQUtHLENBQ0ksSUFBTUUsZUFBZSxHQUFHLFNBQUNDLFdBQW1CLEVBQTZCO0lBQzlFLElBQU1DLGVBQWUsR0FBRyx5Q0FBd0MsQ0FBYyxPQUFaRCxXQUFXLENBQUU7SUFDL0UsSUFBZ0NGLEdBQXVFLEdBQXZFQSwrQ0FBTSxDQUFtQ0csZUFBZSxFQUFFSixnRUFBWSxDQUFDLEVBQS9GSyxJQUFJLEdBQW9CSixHQUF1RSxDQUEvRkksSUFBSSxFQUFFQyxNQUFNLEdBQVlMLEdBQXVFLENBQXpGSyxNQUFNLEVBQUVDLEtBQUssR0FBS04sR0FBdUUsQ0FBakZNLEtBQUs7UUFDZ0NGLElBQVU7SUFBckUsSUFBTUcsWUFBWSxHQUFHLE9BQU9ILENBQUFBLElBQUksYUFBSkEsSUFBSSxXQUFNLEdBQVZBLEtBQUFBLENBQVUsR0FBVkEsSUFBSSxDQUFFQSxJQUFJLE1BQUssUUFBUSxHQUFHLEVBQUUsR0FBR0EsQ0FBQUEsSUFBVSxHQUFWQSxJQUFJLGFBQUpBLElBQUksV0FBTSxHQUFWQSxLQUFBQSxDQUFVLEdBQVZBLElBQUksQ0FBRUEsSUFBSSxjQUFWQSxJQUFVLGNBQVZBLElBQVUsR0FBSSxFQUFFO0lBQzNFLE9BQU87UUFBRUcsWUFBWSxFQUFaQSxZQUFZO1FBQUVDLFNBQVMsRUFBRSxDQUFDSixJQUFJLElBQUksQ0FBQ0UsS0FBSztRQUFFQSxLQUFLLEVBQUxBLEtBQUs7S0FBRSxDQUFDO0NBQzVELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BCa0Q7QUFDUztBQUNuQztBQUNxQjtBQUNZO0FBTTNELElBQU1RLFlBQVksR0FBZ0MsZ0JBQXFCO1FBQWxCWixXQUFXLFNBQVhBLFdBQVc7SUFDOUQsSUFBTSxDQUFHLEdBQUtXLDZEQUFjLEVBQUUsQ0FBdEJFLENBQUM7SUFDVCxJQUEyQ2QsR0FBNEIsR0FBNUJBLHVFQUFlLENBQUNDLFdBQVcsQ0FBQyxFQUEvREssWUFBWSxHQUF1Qk4sR0FBNEIsQ0FBL0RNLFlBQVksRUFBRUMsU0FBUyxHQUFZUCxHQUE0QixDQUFqRE8sU0FBUyxFQUFFRixLQUFLLEdBQUtMLEdBQTRCLENBQXRDSyxLQUFLO0lBRXRDLElBQUlFLFNBQVMsRUFBRTtRQUNiLHFCQUFPLDJEQUFDRSwrREFBYTtZQUFDTSxXQUFXLEVBQUVELENBQUMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDO1VBQUksQ0FBQztLQUNuRTtJQUVELElBQUlULEtBQUssRUFBRTtzQkFDVCwyREFBQ0csOERBQVU7WUFBQ0gsS0FBSyxFQUFFQSxLQUFLO1lBQUVXLFdBQVcsRUFBRUYsQ0FBQyxDQUFDLG1CQUFtQixFQUFFLHFCQUFxQixDQUFDO1VBQUksQ0FBQztLQUMxRjtJQUVELElBQUlSLFlBQVksQ0FBQ1csTUFBTSxFQUFFO3NCQUN2QiwwSEFDR1gsWUFBWSxDQUFDWSxHQUFHLENBQUMsU0FBQ0MsV0FBVztpQ0FDNUIsMkRBQUNULCtEQUFHO2dCQUFDVSxJQUFJLEVBQUMsU0FBUztlQUFFRCxXQUFXLENBQU87U0FDeEMsQ0FBQyxDQUNELENBQUM7S0FDTDtJQUVELHFCQUFPLDJEQUFDRSxLQUFHLE9BQU8sQ0FBQztDQUNwQjtBQUVELGlFQUFlUixZQUFZLEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9Aa2VueWFlbXIvZXNtLXBhdGllbnQtZmxhZ3MtYXBwLy4vc3JjL2hvb2tzL3VzZVBhdGllbnRGbGFncy50c3giLCJ3ZWJwYWNrOi8vQGtlbnlhZW1yL2VzbS1wYXRpZW50LWZsYWdzLWFwcC8uL3NyYy9wYXRpZW50LWZsYWdzL3BhdGllbnQtZmxhZ3MuY29tcG9uZW50LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBvcGVubXJzRmV0Y2ggfSBmcm9tICdAb3Blbm1ycy9lc20tZnJhbWV3b3JrJztcbmltcG9ydCB1c2VTV1IgZnJvbSAnc3dyJztcblxuaW50ZXJmYWNlIFBhdGllbnRGbGFnc1JldHVyblR5cGUge1xuICBwYXRpZW50RmxhZ3M6IEFycmF5PHN0cmluZz47XG4gIGlzTG9hZGluZzogYm9vbGVhbjtcbiAgZXJyb3I6IEVycm9yO1xufVxuXG4vKipcbiAqIFJlYWN0IGhvb2sgdGhhdCB0YWtlcyBpbiBhIHBhdGllbnQgdXVpZCBhbmQgcmV0dXJuc1xuICogcGF0aWVudCBmbGFncyBmb3IgdGhhdCBwYXRpZW50IHRvZ2V0aGVyIHdpdGggaGVscGVyIG9iamVjdHNcbiAqIEBwYXJhbSBwYXRpZW50VXVpZCBVbmlxdWUgcGF0aWVudCBpZGVuZmllclxuICogQHJldHVybnMgQW4gYXJyYXkgb2YgcGF0aWVudCBpZGVudGlmaWVyc1xuICovXG5leHBvcnQgY29uc3QgdXNlUGF0aWVudEZsYWdzID0gKHBhdGllbnRVdWlkOiBzdHJpbmcpOiBQYXRpZW50RmxhZ3NSZXR1cm5UeXBlID0+IHtcbiAgY29uc3QgcGF0aWVudEZsYWdzVXJsID0gYC93cy9yZXN0L3YxL2tlbnlhZW1yL2Zvcm1zP3BhdGllbnRVdWlkPSR7cGF0aWVudFV1aWR9YDtcbiAgY29uc3QgeyBkYXRhLCBtdXRhdGUsIGVycm9yIH0gPSB1c2VTV1I8eyBkYXRhOiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nIH0+KHBhdGllbnRGbGFnc1VybCwgb3Blbm1yc0ZldGNoKTtcbiAgY29uc3QgcGF0aWVudEZsYWdzID0gdHlwZW9mIGRhdGE/LmRhdGEgPT09ICdzdHJpbmcnID8gW10gOiBkYXRhPy5kYXRhID8/IFtdO1xuICByZXR1cm4geyBwYXRpZW50RmxhZ3MsIGlzTG9hZGluZzogIWRhdGEgJiYgIWVycm9yLCBlcnJvciB9O1xufTtcbiIsImltcG9ydCB7IEVycm9yU3RhdGUgfSBmcm9tICdAb3Blbm1ycy9lc20tZnJhbWV3b3JrJztcbmltcG9ydCB7IElubGluZUxvYWRpbmcsIFRhZyB9IGZyb20gJ2NhcmJvbi1jb21wb25lbnRzLXJlYWN0JztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyB1c2VUcmFuc2xhdGlvbiB9IGZyb20gJ3JlYWN0LWkxOG5leHQnO1xuaW1wb3J0IHsgdXNlUGF0aWVudEZsYWdzIH0gZnJvbSAnLi4vaG9va3MvdXNlUGF0aWVudEZsYWdzJztcblxuaW50ZXJmYWNlIFBhdGllbnRGbGFnc1Byb3BzIHtcbiAgcGF0aWVudFV1aWQ6IHN0cmluZztcbn1cblxuY29uc3QgUGF0aWVudEZsYWdzOiBSZWFjdC5GQzxQYXRpZW50RmxhZ3NQcm9wcz4gPSAoeyBwYXRpZW50VXVpZCB9KSA9PiB7XG4gIGNvbnN0IHsgdCB9ID0gdXNlVHJhbnNsYXRpb24oKTtcbiAgY29uc3QgeyBwYXRpZW50RmxhZ3MsIGlzTG9hZGluZywgZXJyb3IgfSA9IHVzZVBhdGllbnRGbGFncyhwYXRpZW50VXVpZCk7XG5cbiAgaWYgKGlzTG9hZGluZykge1xuICAgIHJldHVybiA8SW5saW5lTG9hZGluZyBkZXNjcmlwdGlvbj17dCgnbG9hZGluZycsICdMb2FkaW5nLi4uJyl9IC8+O1xuICB9XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgPEVycm9yU3RhdGUgZXJyb3I9e2Vycm9yfSBoZWFkZXJUaXRsZT17dCgnZXJyb3JQYXRpZW50RmxhZ3MnLCAnUGF0aWVudCBmbGFncyBlcnJvcicpfSAvPjtcbiAgfVxuXG4gIGlmIChwYXRpZW50RmxhZ3MubGVuZ3RoKSB7XG4gICAgPD5cbiAgICAgIHtwYXRpZW50RmxhZ3MubWFwKChwYXRpZW50RmxhZykgPT4gKFxuICAgICAgICA8VGFnIHR5cGU9XCJtYWdlbnRhXCI+e3BhdGllbnRGbGFnfTwvVGFnPlxuICAgICAgKSl9XG4gICAgPC8+O1xuICB9XG5cbiAgcmV0dXJuIDxkaXY+PC9kaXY+O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGF0aWVudEZsYWdzO1xuIl0sIm5hbWVzIjpbIm9wZW5tcnNGZXRjaCIsInVzZVNXUiIsInVzZVBhdGllbnRGbGFncyIsInBhdGllbnRVdWlkIiwicGF0aWVudEZsYWdzVXJsIiwiZGF0YSIsIm11dGF0ZSIsImVycm9yIiwicGF0aWVudEZsYWdzIiwiaXNMb2FkaW5nIiwiRXJyb3JTdGF0ZSIsIklubGluZUxvYWRpbmciLCJUYWciLCJSZWFjdCIsInVzZVRyYW5zbGF0aW9uIiwiUGF0aWVudEZsYWdzIiwidCIsImRlc2NyaXB0aW9uIiwiaGVhZGVyVGl0bGUiLCJsZW5ndGgiLCJtYXAiLCJwYXRpZW50RmxhZyIsInR5cGUiLCJkaXYiXSwic291cmNlUm9vdCI6IiJ9