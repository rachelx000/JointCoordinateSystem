// TODO: Add testing datasets for uploading


export const visualization_data = [
  { name: "Basic Datasets",
    basePath: `${import.meta.env.BASE_URL}data/basics/`,
    filetype: ".csv",
    datasets: [
      {
        title: "Ladder PCP",
        path: "ladder_pcp"
      },
      {
        title: "Ladder PCP (Positive Correlation)",
        path: "ladder_pcp_pos_corr"
      },
      {
        title: "Overlapping PCP & Spider (Positive Correlation)",
        path:"overlapping_pcp_spider_pos_corr"
      },
      {
        title: "No Spider Area",
        path: "no_spider_area"
      }
    ]
  },
  {
    name: "Base Cases (Origin included, Perfect Correlations)",
    basePath: `${import.meta.env.BASE_URL}data/base_cases_incl_origin_perfect_corr/`,
    filetype: ".csv",
    datasets: [
      {
        title: "No correlation exists",
        path: "random"
      },
      {
        title: "Four (+)",
        path: "correlated_case1"
      },
      {
        title: "Three (+) One (-)",
        path: "correlated_case2"
      },
      {
        title: "One (+) Three (-)",
        path: "correlated_case3"
      },
      {
        title: "Two (+) Two (-) [Case1]",
        path: "correlated_case4"
      },
      {
        title: "Two (+) Two (-) [Case2]",
        path: "correlated_case5"
      }]
  },
  {
    name: "Base Cases (Origin not included, Non-perfect Correlations)",
    basePath: `${import.meta.env.BASE_URL}data/base_cases_excl_origin_imperf_corr/`,
    filetype: ".csv",
    datasets: [
      {
        title: "No correlation exists",
        path: "random"
      },
      {
        title: "Four (+)",
        path: "correlated_case1"
      },
      {
        title: "Three (+) One (-)",
        path: "correlated_case2"
      },
      {
        title: "One (+) Three (-)",
        path: "correlated_case3"
      },
      {
        title: "Two (+) Two (-) [Case1]",
        path: "correlated_case4"
      },
      {
        title: "Two (+) Two (-) [Case2]",
        path: "correlated_case5"
      },
    ]
  },
  {
    name: "Real-life Applications",
    basePath: `${import.meta.env.BASE_URL}data/real_life_datasets/`,
    filetype: ".csv",
    datasets: [
      {
        title: "Iris dataset",
        path: "iris_numeric"
      }
    ]
  },
  {
    name: "Hyperparameter Tuning Data",
    basePath: `${import.meta.env.BASE_URL}data/hyperparam_tuning/`,
    filetype: ".csv",
    datasets: [
      {
        title: "Resnet34 (batch_size=32,dropout_rate=0.9)",
        path: "Resnet34_batch_size32dropout_rate0.9"
      },
      {
        title: "Resnet34 (batch_size=32,weight_decay=0.0)",
        path: "Resnet34_batch_size32weight_decay0.0"
      },
      {
        title: "Resnet34 (dropout_rate=0.9,weight_decay=0.0)",
        path: "Resnet34_dropout_rate0.9weight_decay0.0"
      },
      {
        title: "Resnet34 (epoch_number=1,batch_size=32)",
        path: "Resnet34_epoch_number1.0batch_size32"
      },
      {
        title: "Resnet34 (epoch_number=1,dropout_rate=0.9)",
        path: "Resnet34_epoch_number1.0dropout_rate0.9"
      },
      {
        title: "Resnet34 (epoch_number=1,learning_rate=0.001)",
        path: "Resnet34_epoch_number1.0learning_rate0.001"
      },
      {
        title: "Resnet34 (epoch_number=1,weight_decay=0.0)",
        path: "Resnet34_epoch_number1.0weight_decay0.0"
      },
      {
        title: "Resnet34 (learning_rate=0.001,dropout_rate=0.9)",
        path: "Resnet34_learning_rate0.001dropout_rate0.9"
      },
      {
        title: "Resnet34 (learning_rate=0.001,weight_decay=0.0)",
        path: "Resnet34_learning_rate0.001weight_decay0.0"
      },
      {
        title: "Resnet34 (training_size=0.8,weight_decay=0.0)",
        path: "Resnet34_training_size0.8weight_decay0.0"
      },
      {
        title: "Resnet34 (training_size=0.8,dropout_rate=0.9)",
        path: "Resnet34_training_size0.8dropout_rate0.9"
      },
      {
        title: "Resnet34 (training_size=0.8,batch_size=32)",
        path: "Resnet34_training_size0.8batch_size32"
      },
      {
        title: "Resnet34 (training_size=0.8,learning_rate=0.001)",
        path: "Resnet34_training_size0.8learning_rate0.001"
      },
      {
        title: "Resnet34 (training_size=0.8,epoch_number=1.0)",
        path: "Resnet34_training_size0.8epoch_number1.0"
      },
    ]
  }
];
