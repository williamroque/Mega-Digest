c = File::readlines('contract_data.txt').map { |x| x.force_encoding('iso-8859-1').strip.split(';') }

File::readlines('quadra_draw.txt').each do |x|
  x = x.force_encoding("iso-8859-1").split(';')
  if x.length > 4
    u = x[0]
    n = x[3]
    q = x[4]

    ci = c.find_index { |i| i[0] == u and i[3] == n and i.length < 5 }
    if not ci.nil?
      c[ci].push(q)
    end
  end
end

c = c.map do |x| 
  if x.length < 5
    next x.push('')
  end
  next x
end

File::open('output.txt', 'w') { |f| f.write(c.map { |x| x.join(';').force_encoding('utf-8').strip }.join("\n")) }
