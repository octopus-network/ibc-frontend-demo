import React, { useState, useEffect } from 'react'
import { Form, Grid } from 'semantic-ui-react'
import { TxButtonIbc, TxButton } from './substrate-lib/components'
import { useSubstrateState } from './substrate-lib'
import { keyring as Keyring } from '@polkadot/ui-keyring'
import { u8aToHex } from '@polkadot/util';

export default function Main(props) {
  const [currentAccount] = useState(0)
  const socket = props.state.state.socket
  const [status, setStatus] = useState(null)

  useEffect(() => {

  }, [currentAccount, socket])

  const { keyring } = useSubstrateState()
  const accounts = keyring.getPairs()

  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account.meta.name,
      text: account.meta.name,
      value: account.address,
    })
  })

  const ss58ToHex = (ss58) => {
      if (ss58) {
          const publicKey = Keyring.decodeAddress(ss58)
          const hexPublicKey = u8aToHex(publicKey)
          return hexPublicKey.substring(2)
      }
      return ''
  }

  const toHexStr = (myString) => '0x' + new Buffer(myString).toString('hex')

  return (
      <Grid.Column width={8}>
        <Form>
          <Form.Field style={{ textAlign: 'center' }}>
            <TxButton
                label="Query Channel"
                type="QUERY"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'channels',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0')],
                  paramFields: [true, true],
                }}
            />
          </Form.Field>
          <Form.Field style={{ textAlign: 'center' }}>
            <TxButtonIbc
                label="Transfer"
                type="SIGNED-TX"
                setStatus={setStatus}
                attrs={{
                  palletRpc: 'ibc',
                  callable: 'transfer',
                  inputParams: [toHexStr('transfer'), toHexStr('channel-0'), toHexStr(props.tokenName), props.transAmount,
                      toHexStr(ss58ToHex(props.addressTo)),
                      999999, "9999999999999999999"],
                  paramFields: [true, true, true, true, true, true, true],
                    senderAccount: props.senderState.state.currentAccount,
                  senderApi: props.senderState.state.api,
                }}
            />
          </Form.Field>
            <Form.Field style={{ textAlign: 'center' }}>
                <TxButtonIbc
                    label="Transfer Back"
                    type="SIGNED-TX"
                    setStatus={setStatus}
                    attrs={{
                        palletRpc: 'ibc',
                        callable: 'transfer',
                        inputParams: [toHexStr('transfer'), toHexStr('channel-0'), toHexStr("ibc/04C1A8B4EC211C89630916F8424F16DC9611148A5F300C122464CE8E996AABD0"), props.transAmount,
                            toHexStr(ss58ToHex(props.addressFrom )),
                            999999, "9999999999999999999"],
                        paramFields: [true, true, true, true, true, true, true],
                        senderAccount: props.state.state.currentAccount,
                        senderApi: props.state.state.api,
                    }}
                />
            </Form.Field>
          <div style={{ overflowWrap: 'break-word' }}>{status}</div>
        </Form>
      </Grid.Column>
  )
}
