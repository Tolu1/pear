import { FailureDescriptor } from "./common";
import { Intent } from "./actions/types";

export interface TestDataEntry {
    key: string;
    value: string;
    sensitive: boolean;
}

export interface TestData {
    data?: TestDataEntry[];
    other?: string;
}

export interface TestStepDefinition {
    description: string;
    checks: string[];
    testData: TestData;
}

export interface TestCaseDefinition {
    url: string,
    steps: TestStepDefinition[],
    recipe?: Intent[]
}

export type TestCaseResult = SuccessfulTestCaseResult | FailedTestCaseResult;

export interface SuccessfulTestCaseResult {
    passed: true
    recipe: Intent[]
}

export interface FailedTestCaseResult {
    passed: false
    failure: FailureDescriptor
}
