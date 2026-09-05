import apiClient from "./apiClient";

export async function getDatasetSummary(datasetVersion = "predictive_maintenance_v3") {
  const { data } = await apiClient.get("/api/analytics/dataset/summary", {
    params: { dataset_version: datasetVersion },
  });
  return data;
}

export async function trainModel(modelName, datasetVersion = "predictive_maintenance_v3") {
  const { data } = await apiClient.post("/api/analytics/train", {
    model_name: modelName,
    dataset_version: datasetVersion,
  });
  return data;
}

export async function getModelRuns() {
  const { data } = await apiClient.get("/api/analytics/models");
  return data;
}