export const EnumStringRequired = (enumValues: Array<string>, index: number = 0) => {
    return {
        type: String,
        required: true,
        enum: enumValues,
        default: enumValues[index]
    }
}