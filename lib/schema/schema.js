module.exports = 
{
    "type": "object",
    "properties": {
      "restrict": {
        "type": "array",
        "items": [
          {
            "type": "object",
            "properties": {
              "moduleName": {
                "type": "string"
              },
              "importPlace": {
                "type": "string"
              }
            },
            "required": [
              "moduleName",
              "importPlace"
            ]
          }
        ]
      },
      "permit": {
        "type": "array",
        "items": [
          {
            "type": "object",
            "properties": {
              "moduleName": {
                "type": "string"
              },
              "importPlace": {
                "type": "string"
              }
            },
            "required": [
              "moduleName",
              "importPlace"
            ]
          }
        ]
      }
    },
    "required": [
      "restrict",
      "permit"
    ]
  }