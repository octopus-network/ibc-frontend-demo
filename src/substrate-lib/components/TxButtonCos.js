import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'

// import { useSubstrateState } from '../'
import utils from '../utils'

function TxButtonCos({
  attrs = null,
  color = 'blue',
  disabled = false,
  label,
  setStatus,
  style = null,
  type = 'QUERY',
  txOnClickHandler = null,
}) {
  // Hooks
  const { accountsCos, client } = attrs.stateCos
  const [unsub, setUnsub] = useState(null)

  const { inputParams, paramFields } = attrs

  const getFromAcct = async () => {
    const isInjected = false

    if (!isInjected) {
      return accountsCos[0]
    }
  }

  const txResHandler = ( status ) => {
    ( status.code === 0 )
      ? setStatus(`😉 Finalized. Block hash: ${status.transactionHash}`)
      : setStatus(`Current transaction error: ${status.rawLog}`)
    console.log(status)
  }

  const txErrHandler = err => {
    setStatus(`😞 Transaction Failed: ${err.toString()}`)
    console.error(err)
  }


  const signedTx = async () => {
    const fromAcct = await getFromAcct()
    const transformed = transformParams(paramFields, inputParams)
    const fee = {
      amount: [
        {
          denom: "atom",
          amount: "2",
        },
      ],
      gas: "180000", // 180k
    };

    console.log('cos tx request: ', fromAcct.address, ...transformed, undefined, undefined, fee, '')
    const cosResult = await client.sendIbcTokens(fromAcct.address, ...transformed, undefined, undefined, fee, '').catch(txErrHandler)
    console.log('cosResult', cosResult)
    txResHandler(cosResult)
    setUnsub(() => unsub)
  }

  const transaction = async () => {
    if (typeof unsub === 'function') {
      unsub()
      setUnsub(null)
    }

    setStatus('Sending...')

    const asyncFunc = signedTx
    await asyncFunc()

    return txOnClickHandler && typeof txOnClickHandler === 'function'
      ? txOnClickHandler(unsub)
      : null
  }

  const transformParams = (
    paramFields,
    inputParams,
    opts = { emptyAsNull: true }
  ) => {
    // if `opts.emptyAsNull` is true, empty param value will be added to res as `null`.
    //   Otherwise, it will not be added
    const paramVal = inputParams.map(inputParam => {
      // To cater the js quirk that `null` is a type of `object`.
      if (
        typeof inputParam === 'object' &&
        inputParam !== null &&
        typeof inputParam.value === 'string'
      ) {
        return inputParam.value.trim()
      } else if (typeof inputParam === 'string') {
        return inputParam.trim()
      }
      return inputParam
    })
    const params = paramFields.map((field, ind) => ({
      ...field,
      value: paramVal[ind] || null,
    }))

    return params.reduce((memo, { type = 'string', value }) => {
      if (value == null || value === '')
        return opts.emptyAsNull ? [...memo, null] : memo

      let converted = value

      // Deal with a vector
      if (type.indexOf('Vec<') >= 0) {
        converted = converted.split(',').map(e => e.trim())
        converted = converted.map(single =>
          isNumType(type)
            ? single.indexOf('.') >= 0
              ? Number.parseFloat(single)
              : Number.parseInt(single)
            : single
        )
        return [...memo, converted]
      }

      // Deal with a single value
      if (isNumType(type)) {
        converted =
          converted.indexOf('.') >= 0
            ? Number.parseFloat(converted)
            : Number.parseInt(converted)
      }
      return [...memo, converted]
    }, [])
  }

  const isNumType = type =>
    utils.paramConversion.num.some(el => type.indexOf(el) >= 0)

  return (
    <Button
      basic
      color={color}
      style={style}
      type="submit"
      onClick={transaction}
      disabled={ //false
        disabled ||
        // These txs required currentAccount to be set
        (!accountsCos)
      }
    >
      {label}
    </Button>
  )
}

// prop type checking
TxButtonCos.propTypes = {
  setStatus: PropTypes.func.isRequired,
  type: PropTypes.oneOf([
    'QUERY',
    'RPC',
    'SIGNED-TX',
    'UNSIGNED-TX',
    'SUDO-TX',
    'UNCHECKED-SUDO-TX',
    'CONSTANT',
  ]).isRequired,
  attrs: PropTypes.shape({
    palletRpc: PropTypes.string,
    callable: PropTypes.string,
    inputParams: PropTypes.array,
    paramFields: PropTypes.array,
  }).isRequired,
}

export { TxButtonCos }
