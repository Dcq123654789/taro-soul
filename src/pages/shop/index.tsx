import { View, Text, Image } from '@tarojs/components'

export default function Shop () {
  return (
    <View
      style={{
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        padding: '16px 16px 0',
        boxSizing: 'border-box'
      }}
    >
      <View
        style={{
          height: '120px',
          borderRadius: '14px',
          background:
            'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(16,185,129,0.12))',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          padding: '16px',
          marginBottom: '16px'
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
            本周严选
          </Text>
          <View style={{ marginTop: '6px' }}>
            <Text style={{ fontSize: '12px', color: '#475569' }}>
              优惠上新，品质精选好物
            </Text>
          </View>
        </View>
        <Image
          src='https://via.placeholder.com/96x96.png?text=%F0%9F%8E%81'
          style={{ width: '96px', height: '96px', borderRadius: '12px' }}
        />
      </View>

      <View style={{ marginBottom: '12px' }}>
        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#0F172A' }}>
          热门商品
        </Text>
      </View>

      <View
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px'
        } as any}
      >
        {[1, 2, 3, 4].map((idx) => (
          <View
            key={idx}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '12px',
              boxShadow: '0 1px 8px rgba(15, 23, 42, 0.06)'
            }}
          >
            <Image
              src={`https://via.placeholder.com/300x200.png?text=ITEM+${idx}`}
              style={{
                width: '100%',
                height: '96px',
                borderRadius: '10px',
                marginBottom: '8px',
                objectFit: 'cover'
              }}
            />
            <Text
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#0F172A'
              }}
            >
              高颜值实用单品 {idx}
            </Text>
            <View style={{ marginTop: '6px', display: 'flex', flexDirection: 'row' }}>
              <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: '14px' }}>
                ￥{idx}9
              </Text>
              <Text
                style={{
                  color: '#94A3B8',
                  fontSize: '12px',
                  textDecoration: 'line-through',
                  marginLeft: '8px'
                }}
              >
                ￥{idx}9.9
              </Text>
            </View>
            <View
              style={{
                marginTop: '8px',
                display: 'inline-flex',
                padding: '2px 6px',
                borderRadius: '999px',
                backgroundColor: '#F1F5F9'
              }}
            >
              <Text style={{ fontSize: '11px', color: '#475569' }}>包邮・次日达</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

